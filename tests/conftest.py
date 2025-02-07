import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from games.models import Game, Category, Tag
from payments.models import Payment, Transaction
from core.models import Notification, SystemConfiguration
from rest_framework.authtoken.models import Token
import factory
from decimal import Decimal

User = get_user_model()

# Factory Boy factories
class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    is_active = True

class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category

    name = factory.Sequence(lambda n: f'Category {n}')
    description = factory.Faker('text')

class TagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Tag

    name = factory.Sequence(lambda n: f'Tag {n}')

class GameFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Game

    title = factory.Sequence(lambda n: f'Game {n}')
    description = factory.Faker('text')
    price = factory.LazyFunction(lambda: Decimal('9.99'))
    seller = factory.SubFactory(UserFactory)
    category = factory.SubFactory(CategoryFactory)
    version = '1.0.0'
    release_date = factory.Faker('date_object')
    system_requirements = {'min': {'os': 'Windows 10'}}
    is_active = True
    is_approved = True
    
    @factory.post_generation
    def tags(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for tag in extracted:
                self.tags.add(tag)

class PaymentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Payment

    buyer = factory.SubFactory(UserFactory)
    seller = factory.SubFactory(UserFactory)
    game = factory.SubFactory(GameFactory)
    amount = factory.LazyFunction(lambda: Decimal('9.99'))
    status = 'pending'

class NotificationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Notification

    user = factory.SubFactory(UserFactory)
    notification_type = 'system'
    title = factory.Faker('sentence')
    message = factory.Faker('text')

# Fixtures
@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user():
    return UserFactory()

@pytest.fixture
def admin_user():
    return UserFactory(is_staff=True, is_superuser=True)

@pytest.fixture
def auth_client(api_client, user):
    token = Token.objects.create(user=user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return api_client

@pytest.fixture
def admin_auth_client(api_client, admin_user):
    token = Token.objects.create(user=admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return api_client

@pytest.fixture
def category():
    return CategoryFactory()

@pytest.fixture
def tag():
    return TagFactory()

@pytest.fixture
def game(user, category):
    return GameFactory(seller=user, category=category)

@pytest.fixture
def payment(user, game):
    return PaymentFactory(buyer=user, seller=game.seller, game=game)

@pytest.fixture
def notification(user):
    return NotificationFactory(user=user)

@pytest.fixture
def test_password():
    return 'testpass123'

@pytest.fixture
def test_image():
    return SimpleUploadedFile(
        name='test_image.jpg',
        content=b'',  # Add some basic image content here
        content_type='image/jpeg'
    )

@pytest.fixture
def test_game_file():
    return SimpleUploadedFile(
        name='test_game.zip',
        content=b'',  # Add some basic file content here
        content_type='application/zip'
    )

# Mock PayPal API responses
@pytest.fixture
def mock_paypal_payment(mocker):
    class MockPayment:
        def __init__(self):
            self.id = 'TEST_PAYMENT_ID'
            self.state = 'approved'
            self.transactions = [
                type('Transaction', (), {
                    'related_resources': [
                        type('Resource', (), {
                            'sale': type('Sale', (), {'id': 'TEST_SALE_ID'})()
                        })()
                    ]
                })()
            ]
            self.links = [
                type('Link', (), {'rel': 'approval_url', 'href': 'http://test.com/approve'})()
            ]
        def create(self):
            return True

    return mocker.patch('paypalrestsdk.Payment', return_value=MockPayment())

# Redis mock
@pytest.fixture
def mock_redis(mocker):
    mock = mocker.patch('django.core.cache.cache')
    mock.get.return_value = None
    return mock 