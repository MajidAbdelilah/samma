from django.core.management.base import BaseCommand
from django.utils.text import slugify
from games.models import Category

class Command(BaseCommand):
    help = 'Creates initial game categories'

    def handle(self, *args, **kwargs):
        categories = [
            {
                'name': 'Action',
                'description': 'Fast-paced games focusing on combat and movement',
            },
            {
                'name': 'Adventure',
                'description': 'Story-driven games with exploration and puzzle-solving',
            },
            {
                'name': 'RPG',
                'description': 'Role-playing games with character development and rich narratives',
            },
            {
                'name': 'Strategy',
                'description': 'Games that emphasize tactical thinking and planning',
            },
            {
                'name': 'Sports',
                'description': 'Competitive games based on real-world sports',
            },
            {
                'name': 'Racing',
                'description': 'Vehicle-based competition games',
            },
            {
                'name': 'Simulation',
                'description': 'Games that simulate real-world activities or systems',
            },
            {
                'name': 'Puzzle',
                'description': 'Games focused on problem-solving and logical thinking',
            },
            {
                'name': 'Indie',
                'description': 'Games created by independent developers',
            },
            {
                'name': 'MMO',
                'description': 'Massively Multiplayer Online games',
            },
            {
                'name': 'Horror',
                'description': 'Games designed to create fear and suspense',
            },
            {
                'name': 'Educational',
                'description': 'Games designed to teach and develop skills',
            },
        ]

        for category_data in categories:
            category, created = Category.objects.get_or_create(
                name=category_data['name'],
                defaults={
                    'description': category_data['description'],
                    'slug': slugify(category_data['name'])
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category "{category.name}"'))
            else:
                self.stdout.write(self.style.WARNING(f'Category "{category.name}" already exists'))
