import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from games.models import Game
from payments.models import Payment
from rest_framework.authtoken.models import Token
from tests.conftest import *  # Import all fixtures from base conftest

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user():
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )

@pytest.fixture
def auth_client(user):
    client = APIClient()
    token = Token.objects.create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return client

@pytest.fixture
def admin_user():
    return User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='adminpass123'
    )

@pytest.fixture
def admin_auth_client(admin_user):
    client = APIClient()
    token = Token.objects.create(user=admin_user)
    client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return client

@pytest.fixture
def game(user):
    return Game.objects.create(
        title='Test Game',
        description='Test Description',
        price=19.99,
        seller=user,
        is_approved=True
    )

@pytest.fixture
def payment(user, game):
    return Payment.objects.create(
        buyer=user,
        seller=game.seller,
        game=game,
        amount=19.99,
        status='pending'
    )

# Add any accounts-specific fixtures here
@pytest.fixture
def user_profile_data():
    return {
        'first_name': 'Test',
        'last_name': 'User',
        'bio': 'Test bio',
        'phone_number': '+1234567890',
        'paypal_email': 'test.paypal@example.com'
    }

@pytest.fixture
def user_update_data():
    return {
        'username': 'updated_user',
        'first_name': 'Updated',
        'last_name': 'User',
        'current_password': 'testpass123',
        'new_password': 'newtestpass123',
        'confirm_new_password': 'newtestpass123'
    } 