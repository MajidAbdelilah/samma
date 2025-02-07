from celery import shared_task
from django.utils import timezone
from django.contrib.sessions.models import Session
from django.core.cache import cache
from django.db.models import Q
from .models import Notification, AuditLog


@shared_task
def cleanup_expired_sessions():
    """
    Clean up expired sessions from the database
    """
    # Delete expired sessions
    expired = Session.objects.filter(expire_date__lt=timezone.now())
    count = expired.count()
    expired.delete()
    
    return f"Cleaned up {count} expired sessions"


@shared_task
def cleanup_old_notifications():
    """
    Clean up old notifications
    """
    # Define the threshold (e.g., 6 months)
    threshold = timezone.now() - timezone.timedelta(days=180)
    
    # Delete old read notifications
    old_notifications = Notification.objects.filter(
        Q(created_at__lt=threshold),
        Q(is_read=True)
    )
    
    count = old_notifications.count()
    old_notifications.delete()
    
    return f"Cleaned up {count} old notifications"


@shared_task
def cleanup_old_audit_logs():
    """
    Clean up old audit logs
    """
    # Define the threshold (e.g., 1 year)
    threshold = timezone.now() - timezone.timedelta(days=365)
    
    # Delete old audit logs
    old_logs = AuditLog.objects.filter(created_at__lt=threshold)
    count = old_logs.count()
    old_logs.delete()
    
    return f"Cleaned up {count} old audit logs"


@shared_task
def clear_expired_cache():
    """
    Clear expired cache entries
    """
    try:
        cache.clear()
        return "Successfully cleared expired cache entries"
    except Exception as e:
        return f"Error clearing cache: {str(e)}"


@shared_task
def send_inactive_user_notifications():
    """
    Send notifications to users who haven't logged in for a while
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # Define the threshold (e.g., 30 days)
    threshold = timezone.now() - timezone.timedelta(days=30)
    
    # Get inactive users
    inactive_users = User.objects.filter(
        last_login__lt=threshold,
        is_active=True
    )
    
    notification_count = 0
    for user in inactive_users:
        Notification.objects.create(
            user=user,
            notification_type='system',
            title='We miss you!',
            message='It\'s been a while since you last visited Samma. Check out our latest games!',
            data={'last_login': user.last_login.isoformat() if user.last_login else None}
        )
        notification_count += 1
    
    return f"Sent {notification_count} notifications to inactive users"


@shared_task
def update_system_statistics():
    """
    Update system-wide statistics
    """
    from django.contrib.auth import get_user_model
    from games.models import Game
    from payments.models import Payment
    User = get_user_model()
    
    try:
        # Calculate statistics
        stats = {
            'total_users': User.objects.filter(is_active=True).count(),
            'total_games': Game.objects.filter(is_active=True, is_approved=True).count(),
            'total_sales': Payment.objects.filter(status='completed').count(),
            'total_revenue': float(Payment.objects.filter(
                status='completed'
            ).aggregate(
                total=models.Sum('amount')
            )['total'] or 0),
        }
        
        # Store in cache
        cache.set('system_statistics', stats, timeout=3600)  # Cache for 1 hour
        
        # Store in database
        from .models import SystemConfiguration
        SystemConfiguration.objects.update_or_create(
            key='system_statistics',
            defaults={
                'value': stats,
                'description': 'System-wide statistics',
                'is_public': True
            }
        )
        
        return "Successfully updated system statistics"
    
    except Exception as e:
        return f"Error updating system statistics: {str(e)}" 