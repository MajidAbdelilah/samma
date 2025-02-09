from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from games.models import Game, Category, Tag, GameComment
from decimal import Decimal

User = get_user_model()

class GamesAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create test category
        self.category = Category.objects.create(
            name='Action',
            description='Action games'
        )
        
        # Create test tag
        self.tag = Tag.objects.create(name='Multiplayer')
        
        # Create test game
        self.game = Game.objects.create(
            title='Test Game',
            description='Test description',
            price=Decimal('9.99'),
            seller=self.user,
            category=self.category,
            version='1.0.0',
            is_active=True,
            is_approved=True
        )
        
        # URLs - using the API namespace
        self.games_list_url = reverse('api:games:game-list')
        self.game_detail_url = reverse('api:games:game-detail', kwargs={'slug': self.game.slug})
        self.comments_list_url = reverse('api:games:gamecomment-list')
        
    def test_list_games(self):
        """Test retrieving a list of games"""
        # Create a game that should be visible
        Game.objects.create(
            title='Another Game',
            description='Another test description',
            price=Decimal('19.99'),
            seller=self.user,
            category=self.category,
            version='1.0.0',
            is_active=True,
            is_approved=True
        )
        response = self.client.get(self.games_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertTrue(len(response.data['results']) > 0)
        self.assertIn('title', response.data['results'][0])
        
    def test_create_game(self):
        """Test creating a new game"""
        self.client.force_authenticate(user=self.user)
        payload = {
            'title': 'New Game',
            'description': 'New game description',
            'price': '19.99',
            'category_id': self.category.id,
            'version': '1.0.0'
        }
        response = self.client.post(self.games_list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        game = Game.objects.get(title='New Game')
        self.assertEqual(game.seller, self.user)
        
    def test_update_game(self):
        """Test updating a game"""
        self.client.force_authenticate(user=self.user)
        payload = {'title': 'Updated Game'}
        response = self.client.patch(self.game_detail_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.game.refresh_from_db()
        self.assertEqual(self.game.title, 'Updated Game')
        
    def test_delete_game(self):
        """Test deleting a game"""
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.game_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Game.objects.filter(id=self.game.id).exists())
        
    def test_game_detail(self):
        """Test viewing game detail"""
        response = self.client.get(self.game_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.game.title)
        
    def test_unauthorized_create(self):
        """Test creating a game without authentication fails"""
        payload = {
            'title': 'New Game',
            'description': 'New game description',
            'price': '19.99',
            'category_id': self.category.id,
            'version': '1.0.0'
        }
        response = self.client.post(self.games_list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_unauthorized_update(self):
        """Test updating someone else's game fails"""
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='pass123'
        )
        self.client.force_authenticate(user=other_user)
        payload = {'title': 'Updated Game'}
        response = self.client.patch(self.game_detail_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
    def test_add_comment(self):
        """Test adding a comment to a game"""
        self.client.force_authenticate(user=self.user)
        payload = {
            'game': self.game.id,
            'content': 'Great game!',
            'rating': 9
        }
        response = self.client.post(self.comments_list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(GameComment.objects.count(), 1)
        self.game.refresh_from_db()
        self.assertEqual(self.game.rating, Decimal('9.0')) 