import os
from celery import Celery
from django.conf import settings
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'samma.settings')

# Create the Celery app
app = Celery('samma')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Configure Celery Beat schedule
app.conf.beat_schedule = {
    # Games tasks
    'update-game-rankings': {
        'task': 'games.tasks.update_game_rankings',
        'schedule': 300.0,  # Every 5 minutes
    },
    'update-game-statistics': {
        'task': 'games.tasks.update_game_statistics',
        'schedule': 3600.0,  # Every hour
    },
    'cleanup-inactive-games': {
        'task': 'games.tasks.cleanup_inactive_games',
        'schedule': crontab(hour=0, minute=0),  # Daily at midnight
    },
    
    # Payment tasks
    'process-pending-payments': {
        'task': 'payments.tasks.process_pending_payments',
        'schedule': 60.0,  # Every minute
    },
    'process-seller-payments': {
        'task': 'payments.tasks.process_seller_payments',
        'schedule': 3600.0,  # Every hour
    },
    'cleanup-abandoned-payments': {
        'task': 'payments.tasks.cleanup_abandoned_payments',
        'schedule': 3600.0,  # Every hour
    },
    
    # Core system tasks
    'cleanup-expired-sessions': {
        'task': 'core.tasks.cleanup_expired_sessions',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
    'cleanup-old-notifications': {
        'task': 'core.tasks.cleanup_old_notifications',
        'schedule': crontab(hour=3, minute=0),  # Daily at 3 AM
    },
    'cleanup-old-audit-logs': {
        'task': 'core.tasks.cleanup_old_audit_logs',
        'schedule': crontab(day_of_month=1, hour=4),  # Monthly at 4 AM
    },
    'clear-expired-cache': {
        'task': 'core.tasks.clear_expired_cache',
        'schedule': 43200.0,  # Every 12 hours
    },
    'send-inactive-user-notifications': {
        'task': 'core.tasks.send_inactive_user_notifications',
        'schedule': crontab(hour=10, minute=0),  # Daily at 10 AM
    },
    'update-system-statistics': {
        'task': 'core.tasks.update_system_statistics',
        'schedule': 1800.0,  # Every 30 minutes
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 