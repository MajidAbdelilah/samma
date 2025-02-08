from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.cache import cache
from django.conf import settings
import psutil
import redis
from core.models import Notification, AuditLog, SystemConfiguration, FAQ
from core.serializers.core import (
    NotificationSerializer,
    AuditLogSerializer,
    SystemConfigurationSerializer,
    FAQSerializer,
    DashboardStatsSerializer,
    SystemHealthSerializer,
)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint to verify the API is running.
    """
    return Response({'status': 'healthy'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def system_info(request):
    """
    System information endpoint to get version and environment details.
    """
    return Response({
        'version': '1.0.0',
        'environment': 'development',
    }, status=status.HTTP_200_OK)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and managing notifications.
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Mark a notification as read
        """
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """
        Mark all notifications as read
        """
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all notifications marked as read'})


class FAQViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and managing FAQs.
    """
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('category', 'order')


class SystemConfigurationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and managing system configurations.
    """
    queryset = SystemConfiguration.objects.all()
    serializer_class = SystemConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'key'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_public=True)
        return queryset


class DashboardStatsAPIView(generics.RetrieveAPIView):
    """
    API view for retrieving dashboard statistics
    """
    serializer_class = DashboardStatsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Try to get cached statistics
        cache_key = f'dashboard_stats_{self.request.user.id}'
        stats = cache.get(cache_key)
        
        if not stats:
            # Calculate statistics
            from django.contrib.auth import get_user_model
            from games.models import Game
            from payments.models import Payment
            
            User = get_user_model()
            today = timezone.now().date()
            
            stats = {
                'total_users': User.objects.filter(is_active=True).count(),
                'total_games': Game.objects.filter(is_active=True, is_approved=True).count(),
                'total_sales': Payment.objects.filter(status='completed').count(),
                'total_revenue': float(Payment.objects.filter(
                    status='completed'
                ).aggregate(total=Sum('amount'))['total'] or 0),
                'active_users': User.objects.filter(
                    last_login__date=today
                ).count(),
                'new_users_today': User.objects.filter(
                    date_joined__date=today
                ).count(),
                'sales_today': Payment.objects.filter(
                    status='completed',
                    created_at__date=today
                ).count(),
                'revenue_today': float(Payment.objects.filter(
                    status='completed',
                    created_at__date=today
                ).aggregate(total=Sum('amount'))['total'] or 0),
                'top_sellers': list(User.objects.annotate(
                    sales_count=Count('payments_received', filter=Q(payments_received__status='completed'))
                ).order_by('-sales_count')[:5].values('username', 'sales_count')),
                'top_games': list(Game.objects.filter(
                    is_active=True, is_approved=True
                ).order_by('-total_sales')[:5].values('title', 'total_sales')),
                'sales_by_category': dict(Game.objects.values(
                    'category__name'
                ).annotate(count=Count('payments', filter=Q(payments__status='completed')))),
                'revenue_by_category': dict(Game.objects.values(
                    'category__name'
                ).annotate(total=Sum('payments__amount', filter=Q(payments__status='completed'))))
            }
            
            # Cache for 5 minutes
            cache.set(cache_key, stats, 300)
        
        return stats


class MarkNotificationReadAPIView(generics.UpdateAPIView):
    """
    API view for marking notifications as read
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})


class SystemHealthCheckAPIView(generics.RetrieveAPIView):
    """
    API view for checking system health
    """
    serializer_class = SystemHealthSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_object(self):
        # Check database
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            db_status = {'status': 'healthy', 'latency': 0}  # Add actual latency measurement
        except Exception as e:
            db_status = {'status': 'unhealthy', 'error': str(e)}

        # Check Redis cache
        try:
            redis_client = redis.from_url(settings.REDIS_URL)
            redis_client.ping()
            cache_status = {'status': 'healthy', 'used_memory': redis_client.info()['used_memory_human']}
        except Exception as e:
            cache_status = {'status': 'unhealthy', 'error': str(e)}

        # Check Celery
        try:
            from celery.app.control import Control
            from samma.celery import app
            
            control = Control(app)
            active_workers = control.inspect().active()
            celery_status = {
                'status': 'healthy' if active_workers else 'warning',
                'active_workers': len(active_workers) if active_workers else 0
            }
        except Exception as e:
            celery_status = {'status': 'unhealthy', 'error': str(e)}

        # Check storage
        storage_info = psutil.disk_usage('/')
        storage_status = {
            'total': storage_info.total,
            'used': storage_info.used,
            'free': storage_info.free,
            'percent': storage_info.percent
        }

        # Check PayPal API
        try:
            import paypalrestsdk
            paypal_status = {'status': 'healthy'} if paypalrestsdk.api.default().token else {'status': 'unhealthy'}
        except Exception as e:
            paypal_status = {'status': 'unhealthy', 'error': str(e)}

        # System metrics
        memory = psutil.virtual_memory()
        memory_status = {
            'total': memory.total,
            'available': memory.available,
            'percent': memory.percent,
            'used': memory.used
        }

        # Get error rate from logs
        from core.models import AuditLog
        recent_logs = AuditLog.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(hours=1)
        )
        total_logs = recent_logs.count()
        error_logs = recent_logs.filter(
            Q(changes__contains='error') | Q(action='error')
        ).count()
        error_rate = (error_logs / total_logs * 100) if total_logs > 0 else 0

        return {
            'status': 'healthy' if all(
                x['status'] == 'healthy' for x in 
                [db_status, cache_status, celery_status, paypal_status]
            ) else 'degraded',
            'database': db_status,
            'cache': cache_status,
            'celery': celery_status,
            'storage': storage_status,
            'paypal': paypal_status,
            'memory_usage': memory_status,
            'cpu_usage': psutil.cpu_percent(interval=1),
            'disk_usage': storage_status,
            'last_backup': SystemConfiguration.objects.filter(
                key='last_backup_time'
            ).first().value if SystemConfiguration.objects.filter(
                key='last_backup_time'
            ).exists() else None,
            'error_rate': error_rate
        } 