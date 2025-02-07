from django.urls import path
from django.utils.translation import gettext_lazy as _
from accounts.views.frontend import (
    ProfileView,
    ProfileEditView,
    UserGamesView,
    UserSalesView,
    UserPurchasesView,
    UserSettingsView,
)

app_name = 'accounts'

urlpatterns = [
    path(_('profile/'), ProfileView.as_view(), name='profile'),
    path(_('profile/edit/'), ProfileEditView.as_view(), name='profile-edit'),
    path(_('my-games/'), UserGamesView.as_view(), name='my-games'),
    path(_('sales/'), UserSalesView.as_view(), name='sales'),
    path(_('purchases/'), UserPurchasesView.as_view(), name='purchases'),
    path(_('settings/'), UserSettingsView.as_view(), name='settings'),
] 