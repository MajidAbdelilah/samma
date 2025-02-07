import pytest
from payments.models import Payment, Transaction
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from tests.conftest import *  # Import all fixtures from base conftest
from django.utils import timezone

@pytest.fixture
def payment(user, game):
    return Payment.objects.create(
        buyer=user,
        game=game,
        amount=9.99,
        platform_fee=0.99,
        seller_amount=9.00,
        status='pending',
        payment_method='paypal',
        paypal_order_id='test_order_id'
    )

@pytest.fixture
def transaction(payment):
    return Transaction.objects.create(
        payment=payment,
        transaction_type='payment',
        amount=9.99,
        status='success',
        provider_transaction_id='test_transaction_id'
    )

@pytest.fixture
def mock_paypal_payment(mocker):
    mock = mocker.patch('payments.services.paypal.PayPalService.create_payment')
    mock.return_value = {
        'id': 'test_order_id',
        'status': 'CREATED',
        'links': [
            {'rel': 'approve', 'href': 'https://paypal.com/approve'},
            {'rel': 'capture', 'href': 'https://paypal.com/capture'}
        ]
    }
    return mock

# Add any payments-specific fixtures here
@pytest.fixture
def payment_data(game):
    return {
        'game_slug': game.slug,
        'amount': '19.99',
        'payment_method': 'paypal'
    }

@pytest.fixture
def completed_payment(payment):
    payment.status = 'completed'
    payment.paypal_transaction_id = 'TEST_TRANSACTION_ID'
    payment.completed_at = timezone.now()
    payment.save()
    return payment

@pytest.fixture
def transaction(payment):
    return Transaction.objects.create(
        payment=payment,
        transaction_type='purchase',
        amount=payment.amount,
        paypal_transaction_id='TEST_TRANSACTION_ID',
        status='completed',
        notes='Test transaction'
    ) 