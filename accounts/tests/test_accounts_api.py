import pytest
from django.urls import reverse
from rest_framework import status
from accounts.serializers.user import UserSerializer, UserProfileSerializer
from decimal import Decimal

pytestmark = pytest.mark.django_db


class TestUserViewSet:
    def test_list_users(self, admin_client, user):
        url = reverse('api:accounts:user-list')
        response = admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) > 0

    def test_retrieve_user(self, auth_client, user):
        url = reverse('api:accounts:user-detail', kwargs={'username': user.username})
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == user.username

    def test_create_user(self, api_client):
        url = reverse('api:accounts:user-list')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'testpass123',
            'confirm_password': 'testpass123'
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['username'] == data['username']

    def test_update_user(self, auth_client, user):
        url = reverse('api:accounts:user-detail', kwargs={'username': user.username})
        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        response = auth_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['first_name'] == data['first_name']

    def test_me_endpoint(self, auth_client, user):
        url = reverse('api:accounts:user-me')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == user.username


class TestUserProfileAPIView:
    def test_retrieve_profile(self, auth_client, user):
        url = reverse('api:accounts:user-profile')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == user.username

    def test_update_profile(self, auth_client, user):
        url = reverse('api:accounts:user-profile')
        data = {
            'bio': 'New bio',
            'phone_number': '+1234567890'
        }
        response = auth_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['bio'] == data['bio']

    def test_update_paypal_email(self, auth_client, user):
        url = reverse('api:accounts:user-profile')
        data = {
            'paypal_email': 'paypal@example.com'
        }
        response = auth_client.patch(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['paypal_email'] == data['paypal_email']


class TestUserGamesAPIView:
    def test_list_user_games(self, auth_client, game):
        url = reverse('api:accounts:user-games')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['id'] == game.id


class TestUserStatisticsAPIView:
    def test_retrieve_statistics(self, auth_client, user, game, payment):
        # Create a completed payment
        payment.status = 'completed'
        payment.amount = Decimal('19.99')
        payment.save()

        url = reverse('api:accounts:user-statistics')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['total_games'] == 1
        assert response.data['total_sales'] == Decimal('19.99')


@pytest.mark.parametrize('url_name', [
    'api:accounts:user-list',
    'api:accounts:user-profile',
    'api:accounts:user-games',
    'api:accounts:user-statistics',
])
class TestAuthenticationRequired:
    def test_authentication_required(self, api_client, url_name):
        url = reverse(url_name)
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_user_profile_api(auth_client, user):
    url = reverse('api:accounts:user-profile')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['username'] == user.username

def test_user_profile_unauthorized(api_client):
    url = reverse('api:accounts:user-profile')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_user_games_api(auth_client, game):
    url = reverse('api:accounts:user-games')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['title'] == game.title

def test_user_statistics_api(auth_client, user, game, payment):
    url = reverse('api:accounts:user-statistics')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['total_games'] >= 1 