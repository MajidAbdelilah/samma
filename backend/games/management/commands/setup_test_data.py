from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
from games.models import Category, Game
from accounts.models import User

class Command(BaseCommand):
    help = 'Sets up test data for development'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating test data...')

        # Create categories
        categories = [
            {
                'name': 'Action',
                'description': 'Action and fighting games',
            },
            {
                'name': 'Adventure',
                'description': 'Adventure and exploration games',
            },
            {
                'name': 'RPG',
                'description': 'Role-playing games',
            },
            {
                'name': 'Strategy',
                'description': 'Strategy and tactical games',
            },
            {
                'name': 'Sports',
                'description': 'Sports and racing games',
            },
            {
                'name': 'Simulation',
                'description': 'Simulation and management games',
            },
            {
                'name': 'Puzzle',
                'description': 'Puzzle and logic games',
            },
            {
                'name': 'Casual',
                'description': 'Casual and family games',
            },
        ]

        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            self.stdout.write(f'{"Created" if created else "Found"} category: {category.name}')

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
                'category': Category.objects.first(),
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