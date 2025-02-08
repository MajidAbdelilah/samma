from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from django.db.models import Q

from games.models import Game, Category, Tag


class GameListView(ListView):
    model = Game
    template_name = 'games/game_list.html'
    context_object_name = 'games'

    def get_queryset(self):
        return Game.objects.filter(is_approved=True)


class GameDetailView(DetailView):
    model = Game
    template_name = 'games/game_detail.html'
    context_object_name = 'game'

    def get_queryset(self):
        return Game.objects.filter(is_approved=True)


class GameCreateView(LoginRequiredMixin, CreateView):
    model = Game
    template_name = 'games/game_form.html'
    fields = ['title', 'description', 'price', 'categories', 'tags', 'image']
    success_url = reverse_lazy('games:game-list')

    def form_valid(self, form):
        form.instance.owner = self.request.user
        return super().form_valid(form)


class GameUpdateView(LoginRequiredMixin, UpdateView):
    model = Game
    template_name = 'games/game_form.html'
    fields = ['title', 'description', 'price', 'categories', 'tags', 'image']

    def get_queryset(self):
        return Game.objects.filter(owner=self.request.user)

    def get_success_url(self):
        return reverse_lazy('games:game-detail', kwargs={'slug': self.object.slug})


class GameDeleteView(LoginRequiredMixin, DeleteView):
    model = Game
    template_name = 'games/game_confirm_delete.html'
    success_url = reverse_lazy('games:game-list')

    def get_queryset(self):
        return Game.objects.filter(owner=self.request.user)


class CategoryListView(ListView):
    model = Category
    template_name = 'games/category_list.html'
    context_object_name = 'categories'


class CategoryDetailView(DetailView):
    model = Category
    template_name = 'games/category_detail.html'
    context_object_name = 'category'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['games'] = Game.objects.filter(categories=self.object, is_approved=True)
        return context


class TagListView(ListView):
    model = Tag
    template_name = 'games/tag_list.html'
    context_object_name = 'tags'


class TagDetailView(DetailView):
    model = Tag
    template_name = 'games/tag_detail.html'
    context_object_name = 'tag'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['games'] = Game.objects.filter(tags=self.object, is_approved=True)
        return context


class GameSearchView(ListView):
    model = Game
    template_name = 'games/game_search.html'
    context_object_name = 'games'

    def get_queryset(self):
        queryset = Game.objects.filter(is_approved=True)
        q = self.request.GET.get('q')
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q) |
                Q(description__icontains=q) |
                Q(categories__name__icontains=q) |
                Q(tags__name__icontains=q)
            ).distinct()
        return queryset 