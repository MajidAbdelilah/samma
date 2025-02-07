from django.urls import path
from rest_framework.routers import DefaultRouter
from games.views.api import (
    GameViewSet,
    CategoryViewSet,
    TagViewSet,
    GameCommentViewSet,
    GameSearchAPIView,
    TopGamesAPIView,
    GameStatisticsAPIView,
    UpdateGameBidAPIView,
)

app_name = 'games'

router = DefaultRouter()
router.register(r'games', GameViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'tags', TagViewSet)
router.register(r'comments', GameCommentViewSet)

urlpatterns = [
    path('search/', GameSearchAPIView.as_view(), name='game-search'),
    path('top-games/', TopGamesAPIView.as_view(), name='top-games'),
    path('statistics/<int:pk>/', GameStatisticsAPIView.as_view(), name='game-statistics'),
    path('update-bid/<int:pk>/', UpdateGameBidAPIView.as_view(), name='update-game-bid'),
] + router.urls 