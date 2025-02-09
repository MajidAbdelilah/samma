from django.urls import path, include
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
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'comments', GameCommentViewSet, basename='gamecomment')
router.register(r'', GameViewSet, basename='game')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', GameSearchAPIView.as_view(), name='game-search'),
    path('top-games/', TopGamesAPIView.as_view(), name='top-games'),
    path('statistics/<int:pk>/', GameStatisticsAPIView.as_view(), name='game-statistics'),
    path('update-bid/<int:pk>/', UpdateGameBidAPIView.as_view(), name='update-game-bid'),
] 