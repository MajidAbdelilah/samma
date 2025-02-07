from django.urls import path
from rest_framework.routers import DefaultRouter
from accounts.views.api import (
    UserViewSet,
    UserProfileAPIView,
    UserGamesAPIView,
    UserStatisticsAPIView,
)

app_name = 'accounts'

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('profile/', UserProfileAPIView.as_view(), name='user-profile'),
    path('my-games/', UserGamesAPIView.as_view(), name='user-games'),
    path('statistics/', UserStatisticsAPIView.as_view(), name='user-statistics'),
] + router.urls 