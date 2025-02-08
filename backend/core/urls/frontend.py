from django.urls import path
from django.utils.translation import gettext_lazy as _
from core.views.frontend import (
    HomeView,
    DashboardView,
    NotificationsView,
    FAQView,
    AboutView,
    ContactView,
    PrivacyPolicyView,
    TermsOfServiceView,
)

app_name = 'core'

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path(_('dashboard/'), DashboardView.as_view(), name='dashboard'),
    path(_('notifications/'), NotificationsView.as_view(), name='notifications'),
    path(_('faq/'), FAQView.as_view(), name='faq'),
    path(_('about/'), AboutView.as_view(), name='about'),
    path(_('contact/'), ContactView.as_view(), name='contact'),
    path(_('privacy/'), PrivacyPolicyView.as_view(), name='privacy'),
    path(_('terms/'), TermsOfServiceView.as_view(), name='terms'),
] 