import pytest
from django.urls import reverse
from rest_framework import status
from decimal import Decimal
from payments.models import Payment
from unittest.mock import patch

pytestmark = pytest.mark.django_db


class TestPaymentEdgeCases:
    def test_duplicate_payment_prevention(self, auth_client, game):
        """Test that duplicate payments for the same game are prevented"""
        url = reverse('api:payments:payment-create')
        data = {
            'game_id': game.id,
            'payment_method': 'paypal'
        }
        
        # Create first payment
        response1 = auth_client.post(url, data)
        assert response1.status_code == status.HTTP_201_CREATED
        
        # Attempt duplicate payment
        response2 = auth_client.post(url, data)
        assert response2.status_code == status.HTTP_400_BAD_REQUEST
        assert 'already purchased' in str(response2.data)

    @patch('payments.services.paypal.create_order')
    def test_payment_timeout_handling(self, mock_create_order, auth_client, game):
        """Test handling of payment timeouts"""
        mock_create_order.side_effect = TimeoutError("Connection timed out")
        
        url = reverse('api:payments:payment-create')
        data = {
            'game_id': game.id,
            'payment_method': 'paypal'
        }
        
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert 'service temporarily unavailable' in str(response.data).lower()

    def test_partial_payment_handling(self, auth_client, game):
        """Test handling of partial payments"""
        url = reverse('api:payments:payment-create')
        data = {
            'game_id': game.id,
            'payment_method': 'paypal',
            'amount': str(game.price - Decimal('0.01'))  # Slightly less than game price
        }
        
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'invalid payment amount' in str(response.data).lower()

    def test_payment_currency_validation(self, auth_client, game):
        """Test validation of payment currency"""
        url = reverse('api:payments:payment-create')
        data = {
            'game_id': game.id,
            'payment_method': 'paypal',
            'currency': 'INVALID'
        }
        
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'invalid currency' in str(response.data).lower()

    @patch('payments.services.paypal.create_order')
    def test_payment_idempotency(self, mock_create_order, auth_client, game):
        """Test payment idempotency with same idempotency key"""
        mock_create_order.return_value = {'id': 'test_order_id'}
        
        url = reverse('api:payments:payment-create')
        data = {
            'game_id': game.id,
            'payment_method': 'paypal'
        }
        
        # First request with idempotency key
        response1 = auth_client.post(
            url, 
            data,
            HTTP_IDEMPOTENCY_KEY='test-key-123'
        )
        assert response1.status_code == status.HTTP_201_CREATED
        
        # Second request with same idempotency key
        response2 = auth_client.post(
            url,
            data,
            HTTP_IDEMPOTENCY_KEY='test-key-123'
        )
        assert response2.status_code == status.HTTP_200_OK
        assert response1.data['id'] == response2.data['id']

    def test_payment_amount_precision(self, auth_client, game):
        """Test handling of payment amounts with too many decimal places"""
        url = reverse('api:payments:payment-create')
        data = {
            'game_id': game.id,
            'payment_method': 'paypal',
            'amount': '10.999'  # More decimal places than allowed
        }
        
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'decimal places' in str(response.data).lower()

    @patch('payments.services.paypal.create_order')
    def test_concurrent_payment_handling(self, mock_create_order, auth_client, game):
        """Test handling of concurrent payments for the same game"""
        mock_create_order.return_value = {'id': 'test_order_id'}
        
        url = reverse('api:payments:payment-create')
        data = {
            'game_id': game.id,
            'payment_method': 'paypal'
        }
        
        # Simulate two concurrent payments
        response1 = auth_client.post(url, data)
        assert response1.status_code == status.HTTP_201_CREATED
        
        # Second payment should fail
        response2 = auth_client.post(url, data)
        assert response2.status_code == status.HTTP_400_BAD_REQUEST
