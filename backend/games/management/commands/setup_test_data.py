from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from games.models import Category, Game
from accounts.models import User

class Command(BaseCommand):
    help = 'Sets up test data for development'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating test data...')

        # Create category
        category, created = Category.objects.get_or_create(
            name='Action',
            defaults={'description': 'Action games'}
        )
        self.stdout.write(f'{"Created" if created else "Found"} category: Action')

        # Get or create test user
        user = User.objects.first()
        if not user:
            self.stdout.write('No users found. Please create a user first.')
            return

        # Create test game
        game, created = Game.objects.get_or_create(
            title='Test Game',
            defaults={
                'description': 'A test game for development',
                'seller': user,
                'price': Decimal('29.99'),
                'category': category,
                'main_image': 'game_images/test.jpg',
                'game_file': 'game_files/test.zip',
                'version': '1.0',
                'release_date': timezone.now().date(),
                'system_requirements': {
                    'minimum': {'os': 'Windows 10'},
                    'recommended': {'os': 'Windows 11'}
                },
                'is_active': True,
                'is_approved': True
            }
        )
        self.stdout.write(f'{"Created" if created else "Found"} game: Test Game')

        self.stdout.write(self.style.SUCCESS('Successfully created test data')) 