import pytest
from django.urls import reverse
from rest_framework import status
from decimal import Decimal
from payments.models import Payment, Transaction

pytestmark = pytest.mark.django_db


class TestPaymentViewSet:
    def test_list_payments(self, auth_client, payment):
        url = reverse('api:payments:payment-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1
        assert response.data[0]['id'] == payment.id

    def test_retrieve_payment(self, auth_client, payment):
        url = reverse('api:payments:payment-detail', kwargs={'pk': payment.id})
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == payment.id

    def test_list_other_user_payments(self, auth_client):
        # Create payment for another user
        other_payment = PaymentFactory()
        url = reverse('api:payments:payment-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 0


class TestTransactionViewSet:
    def test_list_transactions(self, auth_client, payment):
        transaction = Transaction.objects.create(
            payment=payment,
            transaction_type='purchase',
            amount=payment.amount,
            paypal_transaction_id='TEST123',
            status='completed'
        )
        url = reverse('api:payments:transaction-list')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1


class TestCreatePaymentAPIView:
    def test_create_payment(self, auth_client, game, mock_paypal_payment):
        url = reverse('api:payments:create-payment')
        data = {'game_slug': game.slug}
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert 'payment_id' in response.data
        assert 'approval_url' in response.data

    def test_create_payment_own_game(self, auth_client, game):
        # Try to buy own game
        game.seller = auth_client.handler._force_user
        game.save()
        
        url = reverse('api:payments:create-payment')
        data = {'game_slug': game.slug}
        response = auth_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class TestPayPalWebhookAPIView:
    def test_payment_completed_webhook(self, api_client, payment):
        payment.paypal_payment_id = 'TEST_PAYMENT_ID'
        payment.save()
        
        url = reverse('api:payments:paypal-webhook')
        data = {
            'event_type': 'PAYMENT.SALE.COMPLETED',
            'resource': {
                'parent_payment': 'TEST_PAYMENT_ID',
                'id': 'TEST_SALE_ID'
            }
        }
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        payment.refresh_from_db()
        assert payment.status == 'completed'
        assert payment.transactions.count() == 1


class TestPaymentHistoryAPIView:
    def test_list_payment_history(self, auth_client, payment):
        url = reverse('api:payments:payment-history')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_filter_by_role(self, auth_client, payment):
        url = reverse('api:payments:payment-history')
        response = auth_client.get(url, {'role': 'buyer'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

        response = auth_client.get(url, {'role': 'seller'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 0

    def test_filter_by_status(self, auth_client, payment):
        url = reverse('api:payments:payment-history')
        response = auth_client.get(url, {'status': 'pending'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

        response = auth_client.get(url, {'status': 'completed'})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 0


class TestPaymentStatisticsAPIView:
    def test_retrieve_statistics(self, auth_client, payment):
        # Create completed payment
        payment.status = 'completed'
        payment.amount = Decimal('19.99')
        payment.platform_fee = Decimal('1.99')
        payment.seller_amount = Decimal('18.00')
        payment.save()

        url = reverse('api:payments:payment-statistics')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['total_payments'] == 1
        assert response.data['total_revenue'] == Decimal('19.99')
        assert response.data['total_platform_fees'] == Decimal('1.99')
        assert response.data['total_seller_earnings'] == Decimal('18.00')
        assert response.data['payment_success_rate'] == 100.0
        assert response.data['average_transaction_value'] == Decimal('19.99')
        assert 'daily_transactions' in response.data
        assert 'payment_status_distribution' in response.data


@pytest.mark.parametrize('url_name', [
    'api:payments:payment-list',
    'api:payments:transaction-list',
    'api:payments:payment-history',
    'api:payments:payment-statistics',
])
class TestAuthenticationRequired:
    def test_authentication_required(self, api_client, url_name):
        url = reverse(url_name)
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED 

def test_payment_history(auth_client, completed_payment):
    url = reverse('api:payments:payment-history')
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1
    assert response.data[0]['status'] == 'completed' 