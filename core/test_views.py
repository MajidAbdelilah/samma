from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

class CoreViewsTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_health_check(self):
        """Test the health check endpoint."""
        url = reverse('api:core:health-check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
        self.assertEqual(response.data['status'], 'healthy')

    def test_unauthorized_access(self):
        """Test that unauthorized access is properly handled for system info."""
        url = reverse('api:core:system-info')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_system_info(self):
        """Test the system info endpoint."""
        url = reverse('api:core:system-info')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED) 