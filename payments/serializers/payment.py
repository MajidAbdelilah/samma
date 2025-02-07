from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from payments.models import Payment, Transaction
from accounts.serializers.user import UserSerializer
from games.serializers.game import GameListSerializer


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer for the Transaction model
    """
    class Meta:
        model = Transaction
        fields = (
            'id', 'payment', 'transaction_type', 'amount',
            'paypal_transaction_id', 'status', 'notes',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'payment', 'created_at', 'updated_at'
        )


class PaymentListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing payments
    """
    buyer = UserSerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    game = GameListSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = (
            'id', 'buyer', 'seller', 'game', 'amount',
            'platform_fee', 'seller_amount', 'status',
            'created_at', 'completed_at'
        )
        read_only_fields = fields


class PaymentDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for detailed payment information
    """
    buyer = UserSerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    game = GameListSerializer(read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)

    class Meta:
        model = Payment
        fields = (
            'id', 'buyer', 'seller', 'game', 'amount',
            'platform_fee', 'seller_amount', 'status',
            'paypal_transaction_id', 'paypal_payer_id',
            'paypal_payment_id', 'is_platform_fee_paid',
            'is_seller_paid', 'created_at', 'updated_at',
            'completed_at', 'transactions'
        )
        read_only_fields = fields


class CreatePaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new payments
    """
    game_slug = serializers.SlugField(write_only=True)

    class Meta:
        model = Payment
        fields = ('game_slug',)

    def validate_game_slug(self, value):
        """
        Validate game slug and check if the game exists and is available
        """
        from games.models import Game
        try:
            game = Game.objects.get(slug=value, is_active=True, is_approved=True)
            if game.seller == self.context['request'].user:
                raise serializers.ValidationError(
                    _("You cannot purchase your own game")
                )
            return value
        except Game.DoesNotExist:
            raise serializers.ValidationError(
                _("Game not found or not available")
            )

    def create(self, validated_data):
        """
        Create a new payment
        """
        from games.models import Game
        game = Game.objects.get(slug=validated_data['game_slug'])
        user = self.context['request'].user

        payment = Payment.objects.create(
            buyer=user,
            seller=game.seller,
            game=game,
            amount=game.price
        )
        return payment


class PaymentStatisticsSerializer(serializers.Serializer):
    """
    Serializer for payment statistics
    """
    total_payments = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_platform_fees = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_seller_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_success_rate = serializers.FloatField()
    average_transaction_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    daily_transactions = serializers.DictField(
        child=serializers.IntegerField()
    )
    payment_status_distribution = serializers.DictField(
        child=serializers.IntegerField()
    ) 