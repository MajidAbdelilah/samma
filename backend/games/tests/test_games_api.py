import pytest
from django.urls import reverse
from rest_framework import status
from decimal import Decimal
from games.models import Game, Category, Tag, GameComment

pytestmark = pytest.mark.django_db


class TestCategoryViewSet:
    def test_list_categories(self, auth_client, category):
        url = reverse('api:games:category-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_create_category_admin(self, admin_client):
        url = reverse('api:games:category-list')
        data = {
            'name': 'New Category',
            'description': 'Test description'
        }
        response = admin_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == data['name']

    def test_create_category_user(self, auth_client):
        url = reverse('api:games:category-list')
        data = {
            'name': 'New Category',
            'description': 'Test description'
        }
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestTagViewSet:
    def test_list_tags(self, auth_client, tag):
        url = reverse('api:games:tag-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_create_tag_admin(self, admin_client):
        url = reverse('api:games:tag-list')
        data = {'name': 'New Tag'}
        response = admin_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == data['name']


class TestGameViewSet:
    def test_list_games(self, auth_client, game):
        url = reverse('api:games:game-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_create_game(self, auth_client, category, tag, test_image, test_game_file):
        url = reverse('api:games:game-list')
        data = {
            'title': 'New Game',
            'description': 'Test description',
            'price': '9.99',
            'category_id': category.id,
            'tag_ids': [tag.id],
            'main_image': test_image,
            'game_file': test_game_file,
            'version': '1.0.0',
            'release_date': '2024-01-01',
            'system_requirements': {'min': {'os': 'Windows 10'}},
            'bid_percentage': '5.00'
        }
        response = auth_client.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == data['title']

    def test_update_game(self, auth_client, game):
        url = reverse('api:games:game-detail', kwargs={'slug': game.slug})
        data = {
            'title': 'Updated Game',
            'price': '19.99'
        }
        response = auth_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == data['title']

    def test_update_game_other_user(self, auth_client, game):
        # Create another user's game
        other_game = GameFactory()
        url = reverse('api:games:game-detail', kwargs={'slug': other_game.slug})
        data = {'title': 'Updated Game'}
        response = auth_client.patch(url, data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_approve_game_admin(self, admin_client, game):
        game.is_approved = False
        game.save()
        url = reverse('api:games:game-approve', kwargs={'slug': game.slug})
        response = admin_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        game.refresh_from_db()
        assert game.is_approved is True


class TestGameCommentViewSet:
    def test_create_comment(self, auth_client, game):
        url = reverse('api:games:comment-list')
        data = {
            'game': game.id,
            'content': 'Great game!',
            'rating': 9
        }
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['content'] == data['content']

    def test_create_reply(self, auth_client, game):
        # Create parent comment
        parent = GameComment.objects.create(
            game=game,
            user=auth_client.handler._force_user,
            content='Parent comment'
        )
        url = reverse('api:games:comment-list')
        data = {
            'game': game.id,
            'content': 'Reply comment',
            'parent': parent.id
        }
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['parent'] == parent.id


class TestGameSearchAPIView:
    def test_search_games(self, auth_client, game):
        url = reverse('api:games:game-search')
        response = auth_client.get(url, {'search': game.title})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_filter_by_price(self, auth_client, game):
        url = reverse('api:games:game-search')
        response = auth_client.get(url, {
            'min_price': '5.00',
            'max_price': '15.00'
        })
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1


class TestTopGamesAPIView:
    def test_list_top_games(self, auth_client, game):
        url = reverse('api:games:top-games')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_filter_by_metric(self, auth_client, game):
        url = reverse('api:games:top-games')
        response = auth_client.get(url, {'metric': 'rating'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1


class TestGameStatisticsAPIView:
    def test_retrieve_statistics(self, auth_client, game, payment):
        payment.status = 'completed'
        payment.save()
        
        url = reverse('api:games:game-statistics', kwargs={'pk': game.id})
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['total_sales'] == 1


class TestUpdateGameBidAPIView:
    def test_update_bid(self, auth_client, game):
        url = reverse('api:games:update-game-bid', kwargs={'pk': game.id})
        data = {'bid_percentage': '7.50'}
        response = auth_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        game.refresh_from_db()
        assert game.bid_percentage == Decimal('7.50')

def test_list_games(auth_client, game):
    url = reverse('api:games:game-list')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1
    assert response.data[0]['title'] == game.title

def test_create_game(auth_client, game_data):
    url = reverse('api:games:game-list')
    response = auth_client.post(url, game_data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['title'] == game_data['title']

def test_update_game(auth_client, game, game_update_data):
    url = reverse('api:games:game-detail', kwargs={'slug': game.slug})
    response = auth_client.patch(url, game_update_data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['title'] == game_update_data['title']

def test_game_comments(auth_client, game, game_comment):
    url = reverse('api:games:game-detail', kwargs={'slug': game.slug})
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data['comments']) == 1
    assert response.data['comments'][0]['content'] == game_comment.content 