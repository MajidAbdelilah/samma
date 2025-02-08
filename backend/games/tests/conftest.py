import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from games.models import Game, Category, Tag, GameComment
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from tests.conftest import *  # Import all fixtures from base conftest

@pytest.fixture
def category():
    return Category.objects.create(name='Action', description='Action games')

@pytest.fixture
def tag():
    return Tag.objects.create(name='Multiplayer')

@pytest.fixture
def test_image():
    return SimpleUploadedFile(
        name='test_image.jpg',
        content=b'',
        content_type='image/jpeg'
    )

@pytest.fixture
def test_game_file():
    return SimpleUploadedFile(
        name='test_game.zip',
        content=b'',
        content_type='application/zip'
    )

@pytest.fixture
def game(user, category, tag, test_image, test_game_file):
    game = Game.objects.create(
        title='Test Game',
        description='A test game',
        seller=user,
        price=9.99,
        image=test_image,
        file=test_game_file,
        is_approved=True
    )
    game.categories.add(category)
    game.tags.add(tag)
    return game

@pytest.fixture
def game_data(category, tag):
    return {
        'title': 'New Test Game',
        'description': 'A new test game description',
        'price': '19.99',
        'category_id': category.id,
        'tag_ids': [tag.id],
        'version': '1.0.0',
        'release_date': '2024-01-01',
        'system_requirements': {'min': {'os': 'Windows 10'}},
        'bid_percentage': 5.0
    }

@pytest.fixture
def game_comment(user, game):
    return GameComment.objects.create(
        game=game,
        user=user,
        content='Great game!',
        rating=8
    )

@pytest.fixture
def game_update_data():
    return {
        'title': 'Updated Game Title',
        'description': 'Updated game description',
        'price': '29.99',
        'bid_percentage': 7.5,
        'version': '1.1.0'
    } 