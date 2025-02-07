from django.urls import path
from django.utils.translation import gettext_lazy as _
from games.views.frontend import (
    GameListView,
    GameDetailView,
    GameCreateView,
    GameUpdateView,
    GameDeleteView,
    CategoryListView,
    CategoryDetailView,
    TagListView,
    TagDetailView,
    GameSearchView,
)

app_name = 'games'

urlpatterns = [
    # Game views
    path('', GameListView.as_view(), name='game-list'),
    path(_('create/'), GameCreateView.as_view(), name='game-create'),
    path(_('search/'), GameSearchView.as_view(), name='game-search'),
    path('<slug:slug>/', GameDetailView.as_view(), name='game-detail'),
    path(_('edit/<slug:slug>/'), GameUpdateView.as_view(), name='game-update'),
    path(_('delete/<slug:slug>/'), GameDeleteView.as_view(), name='game-delete'),
    
    # Category views
    path(_('categories/'), CategoryListView.as_view(), name='category-list'),
    path(_('category/<slug:slug>/'), CategoryDetailView.as_view(), name='category-detail'),
    
    # Tag views
    path(_('tags/'), TagListView.as_view(), name='tag-list'),
    path(_('tag/<slug:slug>/'), TagDetailView.as_view(), name='tag-detail'),
] 