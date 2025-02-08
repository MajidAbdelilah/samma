from django.urls import path
from django.utils.translation import gettext_lazy as _
from payments.views.frontend import (
    PaymentHistoryView,
    PaymentDetailView,
    CheckoutView,
    PaymentSuccessView,
    PaymentCancelView,
    PaymentFailureView,
    SalesReportView,
)

app_name = 'payments'

urlpatterns = [
    path(_('history/'), PaymentHistoryView.as_view(), name='payment-history'),
    path(_('detail/<int:pk>/'), PaymentDetailView.as_view(), name='payment-detail'),
    path(_('checkout/<slug:game_slug>/'), CheckoutView.as_view(), name='checkout'),
    path(_('success/'), PaymentSuccessView.as_view(), name='payment-success'),
    path(_('cancel/'), PaymentCancelView.as_view(), name='payment-cancel'),
    path(_('failure/'), PaymentFailureView.as_view(), name='payment-failure'),
    path(_('sales-report/'), SalesReportView.as_view(), name='sales-report'),
] 