from django.views.generic import TemplateView, ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from core.models import Notification, FAQ
from games.models import Game
from payments.models import Payment
from django.db.models import Sum, Count
from django.utils import timezone

class HomeView(TemplateView):
    """
    Home page view
    """
    template_name = 'core/home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['featured_games'] = Game.objects.filter(
            is_active=True,
            is_approved=True
        ).order_by('-ad_score')[:6]
        return context


class DashboardView(LoginRequiredMixin, TemplateView):
    """
    User dashboard view
    """
    template_name = 'core/dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        today = timezone.now().date()

        # Get user's games
        context['user_games'] = user.games.all()[:5]

        # Get recent sales/purchases
        context['recent_sales'] = Payment.objects.filter(
            seller=user,
            status='completed'
        ).order_by('-created_at')[:5]
        context['recent_purchases'] = Payment.objects.filter(
            buyer=user,
            status='completed'
        ).order_by('-created_at')[:5]

        # Get statistics
        context['total_sales'] = Payment.objects.filter(
            seller=user,
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        context['total_games'] = user.games.count()

        return context


class NotificationsView(LoginRequiredMixin, ListView):
    """
    User notifications view
    """
    template_name = 'core/notifications.html'
    context_object_name = 'notifications'
    paginate_by = 20

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')


class FAQView(TemplateView):
    """
    FAQ page view
    """
    template_name = 'core/faq.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['faqs'] = FAQ.objects.filter(
            is_active=True
        ).order_by('category', 'order')
        return context


class AboutView(TemplateView):
    """
    About page view
    """
    template_name = 'core/about.html'


class ContactView(TemplateView):
    """
    Contact page view
    """
    template_name = 'core/contact.html'


class PrivacyPolicyView(TemplateView):
    """
    Privacy policy page view
    """
    template_name = 'core/privacy_policy.html'


class TermsOfServiceView(TemplateView):
    """
    Terms of service page view
    """
    template_name = 'core/terms_of_service.html' 