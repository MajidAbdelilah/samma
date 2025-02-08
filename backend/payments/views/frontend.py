from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, TemplateView
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Sum

from payments.models import Payment


class PaymentHistoryView(LoginRequiredMixin, ListView):
    template_name = 'payments/payment_history.html'
    context_object_name = 'payments'
    paginate_by = 20

    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.filter(Q(buyer=user) | Q(seller=user))
        
        # Filter by role
        role = self.request.GET.get('role')
        if role == 'buyer':
            queryset = queryset.filter(buyer=user)
        elif role == 'seller':
            queryset = queryset.filter(seller=user)
        
        # Filter by status
        status = self.request.GET.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset.order_by('-created_at')


class PaymentDetailView(LoginRequiredMixin, DetailView):
    template_name = 'payments/payment_detail.html'
    context_object_name = 'payment'

    def get_queryset(self):
        user = self.request.user
        return Payment.objects.filter(Q(buyer=user) | Q(seller=user))


class CheckoutView(LoginRequiredMixin, TemplateView):
    template_name = 'payments/checkout.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from games.models import Game
        game_slug = kwargs.get('game_slug')
        context['game'] = get_object_or_404(Game, slug=game_slug, is_active=True, is_approved=True)
        return context


class PaymentSuccessView(LoginRequiredMixin, TemplateView):
    template_name = 'payments/payment_success.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        payment_id = self.request.GET.get('payment_id')
        if payment_id:
            context['payment'] = get_object_or_404(Payment, id=payment_id, buyer=self.request.user)
        return context


class PaymentCancelView(LoginRequiredMixin, TemplateView):
    template_name = 'payments/payment_cancel.html'


class PaymentFailureView(LoginRequiredMixin, TemplateView):
    template_name = 'payments/payment_failure.html'


class SalesReportView(LoginRequiredMixin, TemplateView):
    template_name = 'payments/sales_report.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        
        # Get all completed sales
        sales = Payment.objects.filter(
            seller=user,
            status='completed'
        )
        
        context['total_sales'] = sales.count()
        context['total_revenue'] = sales.aggregate(total=Sum('amount'))['total'] or 0
        context['platform_fees'] = sales.aggregate(total=Sum('platform_fee'))['total'] or 0
        context['net_earnings'] = sales.aggregate(total=Sum('seller_amount'))['total'] or 0
        
        return context 