from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import paypalrestsdk
from payments.models import Payment, Transaction
from payments.serializers.payment import (
    PaymentListSerializer,
    PaymentDetailSerializer,
    CreatePaymentSerializer,
    TransactionSerializer,
    PaymentStatisticsSerializer,
)
from games.models import Game


# Configure PayPal
paypalrestsdk.configure({
    "mode": settings.PAYPAL_MODE,
    "client_id": settings.PAYPAL_CLIENT_ID,
    "client_secret": settings.PAYPAL_CLIENT_SECRET
})


class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing payment instances.
    """
    queryset = Payment.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return PaymentListSerializer
        return PaymentDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_staff:
            queryset = queryset.filter(
                Q(buyer=user) | Q(seller=user)
            )
        
        return queryset.select_related('buyer', 'seller', 'game')


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing transaction instances.
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_staff:
            queryset = queryset.filter(
                Q(payment__buyer=user) | Q(payment__seller=user)
            )
        
        return queryset.select_related('payment')


class CreatePaymentAPIView(generics.CreateAPIView):
    """
    API view for creating new payments
    """
    serializer_class = CreatePaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()

        # Create PayPal payment
        paypal_payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": f"{settings.FRONTEND_URL}/payments/success/",
                "cancel_url": f"{settings.FRONTEND_URL}/payments/cancel/"
            },
            "transactions": [{
                "amount": {
                    "total": str(payment.amount),
                    "currency": "USD"
                },
                "description": f"Purchase of {payment.game.title}"
            }]
        })

        if paypal_payment.create():
            # Store PayPal payment ID
            payment.paypal_payment_id = paypal_payment.id
            payment.save()

            # Get approval URL
            approval_url = next(link.href for link in paypal_payment.links if link.rel == 'approval_url')
            
            return Response({
                'payment_id': payment.id,
                'approval_url': approval_url
            })
        else:
            payment.status = 'failed'
            payment.save()
            return Response(
                {'error': paypal_payment.error},
                status=status.HTTP_400_BAD_REQUEST
            )


class PayPalWebhookAPIView(APIView):
    """
    API view for handling PayPal webhooks
    """
    permission_classes = []  # No authentication required for webhooks

    def post(self, request, *args, **kwargs):
        # Verify webhook signature (in production)
        # Process webhook event
        event_type = request.data.get('event_type')
        resource = request.data.get('resource', {})
        
        if event_type == 'PAYMENT.SALE.COMPLETED':
            # Process completed payment
            payment_id = resource.get('parent_payment')
            try:
                payment = Payment.objects.get(paypal_payment_id=payment_id)
                payment.status = 'completed'
                payment.completed_at = timezone.now()
                payment.save()
                
                # Create transaction record
                Transaction.objects.create(
                    payment=payment,
                    transaction_type='purchase',
                    amount=payment.amount,
                    paypal_transaction_id=resource.get('id'),
                    status='completed'
                )
                
                # Trigger Celery task to process game purchase
                from games.tasks import process_game_purchase
                process_game_purchase.delay(payment.id)
                
            except Payment.DoesNotExist:
                return Response(
                    {'error': 'Payment not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        return Response({'status': 'processed'})


class PaymentHistoryAPIView(generics.ListAPIView):
    """
    API view for viewing payment history
    """
    serializer_class = PaymentListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.filter(
            Q(buyer=user) | Q(seller=user)
        ).select_related('buyer', 'seller', 'game')
        
        # Filter by role (buyer/seller)
        role = self.request.query_params.get('role')
        if role == 'buyer':
            queryset = queryset.filter(buyer=user)
        elif role == 'seller':
            queryset = queryset.filter(seller=user)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset.order_by('-created_at')


class PaymentStatisticsAPIView(generics.RetrieveAPIView):
    """
    API view for retrieving payment statistics
    """
    serializer_class = PaymentStatisticsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        completed_payments = Payment.objects.filter(
            Q(buyer=user) | Q(seller=user),
            status='completed'
        )
        
        # Calculate statistics
        total_payments = completed_payments.count()
        total_revenue = completed_payments.aggregate(total=Sum('amount'))['total'] or 0
        total_platform_fees = completed_payments.aggregate(
            total=Sum('platform_fee'))['total'] or 0
        total_seller_earnings = completed_payments.aggregate(
            total=Sum('seller_amount'))['total'] or 0
        
        # Calculate success rate
        all_payments = Payment.objects.filter(Q(buyer=user) | Q(seller=user))
        payment_success_rate = (
            total_payments / all_payments.count() * 100
            if all_payments.count() > 0 else 0
        )
        
        # Calculate average transaction value
        average_transaction_value = (
            total_revenue / total_payments
            if total_payments > 0 else 0
        )
        
        # Get daily transactions for the last 30 days
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        daily_transactions = (
            completed_payments
            .filter(created_at__gte=thirty_days_ago)
            .extra(select={'day': 'DATE(created_at)'})
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        
        # Get payment status distribution
        status_distribution = (
            all_payments
            .values('status')
            .annotate(count=Count('id'))
        )
        
        return {
            'total_payments': total_payments,
            'total_revenue': total_revenue,
            'total_platform_fees': total_platform_fees,
            'total_seller_earnings': total_seller_earnings,
            'payment_success_rate': payment_success_rate,
            'average_transaction_value': average_transaction_value,
            'daily_transactions': {
                str(item['day']): item['count']
                for item in daily_transactions
            },
            'payment_status_distribution': {
                item['status']: item['count']
                for item in status_distribution
            }
        } 