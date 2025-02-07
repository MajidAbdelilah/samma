from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView, ListView
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _

from accounts.models import User
from games.models import Game
from payments.models import Payment


class ProfileView(LoginRequiredMixin, TemplateView):
    template_name = 'accounts/profile.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        return context


class ProfileEditView(LoginRequiredMixin, TemplateView):
    template_name = 'accounts/profile_edit.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        return context


class UserGamesView(LoginRequiredMixin, ListView):
    template_name = 'accounts/my_games.html'
    context_object_name = 'games'

    def get_queryset(self):
        return Game.objects.filter(owner=self.request.user)


class UserSalesView(LoginRequiredMixin, ListView):
    template_name = 'accounts/sales.html'
    context_object_name = 'sales'

    def get_queryset(self):
        return Payment.objects.filter(seller=self.request.user)


class UserPurchasesView(LoginRequiredMixin, ListView):
    template_name = 'accounts/purchases.html'
    context_object_name = 'purchases'

    def get_queryset(self):
        return Payment.objects.filter(buyer=self.request.user)


class UserSettingsView(LoginRequiredMixin, TemplateView):
    template_name = 'accounts/settings.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['user'] = self.request.user
        return context 