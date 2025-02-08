from django.urls import path
from rest_framework.routers import DefaultRouter
from payments.views.api import (
    PaymentViewSet,
    TransactionViewSet,
    CreatePaymentAPIView,
    PayPalWebhookAPIView,
    PaymentHistoryAPIView,
    PaymentStatisticsAPIView,
)

app_name = 'payments'

router = DefaultRouter()
router.register(r'payments', PaymentViewSet)
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('create-payment/', CreatePaymentAPIView.as_view(), name='create-payment'),
    path('paypal-webhook/', PayPalWebhookAPIView.as_view(), name='paypal-webhook'),
    path('history/', PaymentHistoryAPIView.as_view(), name='payment-history'),
    path('statistics/', PaymentStatisticsAPIView.as_view(), name='payment-statistics'),
] + router.urls 