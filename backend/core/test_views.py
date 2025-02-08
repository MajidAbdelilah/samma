from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

User = get_user_model()

class CoreViewsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

    def test_health_check(self):
        """Test the health check endpoint."""
        url = reverse('api:core:health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
        self.assertEqual(response.data['status'], 'healthy')

    def test_unauthorized_access(self):
        """Test that unauthorized access is properly handled."""
        self.client.credentials()  # Remove auth credentials
        url = reverse('api:core:health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_system_info(self):
        """Test the system info endpoint."""
        url = reverse('api:core:system-info')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('version', response.data)
        self.assertIn('environment', response.data) 