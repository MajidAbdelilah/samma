from django.urls import path
from rest_framework.routers import DefaultRouter
from core.views.api import (
    NotificationViewSet,
    FAQViewSet,
    SystemConfigurationViewSet,
    DashboardStatsAPIView,
    MarkNotificationReadAPIView,
    SystemHealthCheckAPIView,
    health_check,
    system_info,
    GetCSRFToken,
)

app_name = 'core'

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet)
router.register(r'faqs', FAQViewSet)
router.register(r'system-config', SystemConfigurationViewSet)

urlpatterns = [
    path('dashboard/stats/', DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    path('notifications/mark-read/<int:pk>/', MarkNotificationReadAPIView.as_view(), name='mark-notification-read'),
    path('system/health-check/', health_check, name='health-check'),
    path('system/info/', system_info, name='system-info'),
    path('health/', SystemHealthCheckAPIView.as_view(), name='system-health'),
    path('csrf/', GetCSRFToken.as_view(), name='csrf-token'),
] + router.urls 