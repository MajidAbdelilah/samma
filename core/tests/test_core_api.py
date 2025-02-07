import pytest
from django.urls import reverse
from rest_framework import status
from core.models import Notification, FAQ, SystemConfiguration
from decimal import Decimal

pytestmark = pytest.mark.django_db


class TestNotificationViewSet:
    def test_list_notifications(self, auth_client, notification):
        url = reverse('api:core:notification-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['id'] == notification.id

    def test_mark_notification_read(self, auth_client, notification):
        url = reverse('api:core:mark-notification-read', kwargs={'pk': notification.id})
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        notification.refresh_from_db()
        assert notification.is_read is True

    def test_mark_all_notifications_read(self, auth_client, notification):
        url = reverse('api:core:notification-mark-all-read')
        response = auth_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        notification.refresh_from_db()
        assert notification.is_read is True


class TestFAQViewSet:
    def test_list_faqs(self, auth_client, faq):
        url = reverse('api:core:faq-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
        assert response.data['results'][0]['question'] == faq.question

    def test_create_faq_admin(self, admin_client):
        url = reverse('api:core:faq-list')
        data = {
            'question': 'Test Question',
            'answer': 'Test Answer',
            'category': 'general',
            'order': 1
        }
        response = admin_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['question'] == data['question']

    def test_create_faq_user(self, auth_client):
        url = reverse('api:core:faq-list')
        data = {
            'question': 'Test Question',
            'answer': 'Test Answer',
            'category': 'general'
        }
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestSystemConfigurationViewSet:
    def test_list_public_configs(self, auth_client):
        config = SystemConfiguration.objects.create(
            key='public_config',
            value={'test': 'value'},
            is_public=True
        )
        url = reverse('api:core:system-config-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['key'] == config.key

    def test_list_private_configs_admin(self, admin_client):
        config = SystemConfiguration.objects.create(
            key='private_config',
            value={'test': 'value'},
            is_public=False
        )
        url = reverse('api:core:system-config-list')
        response = admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_update_config_admin(self, admin_client):
        config = SystemConfiguration.objects.create(
            key='test_config',
            value={'test': 'value'}
        )
        url = reverse('api:core:system-config-detail', kwargs={'key': config.key})
        data = {
            'value': {'test': 'updated'},
            'description': 'Updated description'
        }
        response = admin_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.data['value'] == data['value']


class TestDashboardStatsAPIView:
    def test_retrieve_stats(self, auth_client, game, payment):
        url = reverse('api:core:dashboard-stats')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'total_users' in response.data
        assert 'total_games' in response.data
        assert 'total_sales' in response.data
        assert 'total_revenue' in response.data


class TestSystemHealthCheckAPIView:
    def test_health_check_admin(self, admin_client):
        url = reverse('api:core:system-health-check')
        response = admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'status' in response.data
        assert 'database' in response.data

    def test_health_check_user(self, auth_client):
        url = reverse('api:core:system-health-check')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.parametrize('url_name', [
    'api:core:notification-list',
    'api:core:faq-list',
    'api:core:system-config-list',
    'api:core:dashboard-stats',
])
class TestAuthenticationRequired:
    def test_authentication_required(self, api_client, url_name):
        url = reverse(url_name)
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED 