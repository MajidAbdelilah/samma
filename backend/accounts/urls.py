from django.urls import path
from .views.api import (
    UserRegistrationView,
    LoginView,
    logout_view,
    UserProfileAPIView,
    UserGamesAPIView,
    UserStatisticsAPIView,
)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('profile/', UserProfileAPIView.as_view(), name='profile'),
    path('my-games/', UserGamesAPIView.as_view(), name='user-games'),
    path('statistics/', UserStatisticsAPIView.as_view(), name='user-statistics'),
] 