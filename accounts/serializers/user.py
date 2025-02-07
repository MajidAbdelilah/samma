from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model with basic information
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model with detailed profile information
    """
    total_games = serializers.IntegerField(read_only=True)
    total_sales = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'profile_picture', 'bio', 'date_of_birth', 'phone_number',
            'paypal_email', 'total_games', 'total_sales', 'average_rating',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'email', 'created_at', 'updated_at')
        extra_kwargs = {
            'date_of_birth': {'required': False},
            'phone_number': {'required': False},
            'paypal_email': {'required': False},
        }

    def validate_paypal_email(self, value):
        """
        Validate PayPal email
        """
        if value and value == self.instance.email:
            raise serializers.ValidationError(
                _("PayPal email must be different from your account email")
            )
        return value


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users
    """
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name'
        )

    def validate(self, data):
        """
        Check that the passwords match
        """
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError(
                {"confirm_password": _("Passwords do not match")}
            )
        return data

    def create(self, validated_data):
        """
        Create and return a new user
        """
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information
    """
    current_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False, min_length=8)
    confirm_new_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = (
            'username', 'first_name', 'last_name', 'profile_picture',
            'bio', 'date_of_birth', 'phone_number', 'paypal_email',
            'current_password', 'new_password', 'confirm_new_password'
        )
        extra_kwargs = {
            'username': {'required': False},
            'date_of_birth': {'required': False},
            'phone_number': {'required': False},
            'paypal_email': {'required': False},
        }

    def validate(self, data):
        """
        Validate the password change if requested
        """
        if 'new_password' in data or 'confirm_new_password' in data:
            if not data.get('current_password'):
                raise serializers.ValidationError(
                    {"current_password": _("Current password is required to set a new password")}
                )
            if not self.instance.check_password(data.get('current_password')):
                raise serializers.ValidationError(
                    {"current_password": _("Current password is incorrect")}
                )
            if data.get('new_password') != data.get('confirm_new_password'):
                raise serializers.ValidationError(
                    {"confirm_new_password": _("New passwords do not match")}
                )

        return data

    def update(self, instance, validated_data):
        """
        Update and return an existing user
        """
        # Remove password fields from validated data
        validated_data.pop('current_password', None)
        new_password = validated_data.pop('new_password', None)
        validated_data.pop('confirm_new_password', None)

        # Update the password if provided
        if new_password:
            instance.set_password(new_password)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class UserStatisticsSerializer(serializers.ModelSerializer):
    """
    Serializer for user statistics
    """
    total_games = serializers.IntegerField(read_only=True)
    total_sales = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)
    total_purchases = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'total_games', 'total_sales',
            'average_rating', 'total_purchases', 'total_spent'
        )
        read_only_fields = fields

    def get_total_purchases(self, obj):
        """
        Get total number of purchases made by the user
        """
        return obj.payments_made.filter(status='completed').count()

    def get_total_spent(self, obj):
        """
        Get total amount spent by the user
        """
        return obj.payments_made.filter(status='completed').aggregate(
            total=models.Sum('amount'))['total'] or 0 