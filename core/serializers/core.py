from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from core.models import Notification, AuditLog, SystemConfiguration, FAQ


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Notification model
    """
    class Meta:
        model = Notification
        fields = (
            'id', 'user', 'notification_type', 'title',
            'message', 'data', 'is_read', 'created_at'
        )
        read_only_fields = (
            'id', 'user', 'notification_type', 'title',
            'message', 'data', 'created_at'
        )


class AuditLogSerializer(serializers.ModelSerializer):
    """
    Serializer for the AuditLog model
    """
    class Meta:
        model = AuditLog
        fields = (
            'id', 'user', 'action', 'model_name', 'object_id',
            'object_repr', 'changes', 'ip_address', 'user_agent',
            'created_at'
        )
        read_only_fields = fields


class SystemConfigurationSerializer(serializers.ModelSerializer):
    """
    Serializer for the SystemConfiguration model
    """
    class Meta:
        model = SystemConfiguration
        fields = (
            'id', 'key', 'value', 'description',
            'is_public', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def to_representation(self, instance):
        """
        Only show public configurations to non-staff users
        """
        data = super().to_representation(instance)
        request = self.context.get('request')
        if not request or not request.user.is_staff:
            if not instance.is_public:
                return None
            # Remove sensitive fields for public configs
            data.pop('created_at', None)
            data.pop('updated_at', None)
            data.pop('is_public', None)
        return data


class FAQSerializer(serializers.ModelSerializer):
    """
    Serializer for the FAQ model
    """
    class Meta:
        model = FAQ
        fields = (
            'id', 'question', 'answer', 'category',
            'order', 'is_active', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class DashboardStatsSerializer(serializers.Serializer):
    """
    Serializer for dashboard statistics
    """
    total_users = serializers.IntegerField()
    total_games = serializers.IntegerField()
    total_sales = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    active_users = serializers.IntegerField()
    new_users_today = serializers.IntegerField()
    sales_today = serializers.IntegerField()
    revenue_today = serializers.DecimalField(max_digits=10, decimal_places=2)
    top_sellers = serializers.ListField(
        child=serializers.DictField()
    )
    top_games = serializers.ListField(
        child=serializers.DictField()
    )
    sales_by_category = serializers.DictField(
        child=serializers.IntegerField()
    )
    revenue_by_category = serializers.DictField(
        child=serializers.DecimalField(max_digits=10, decimal_places=2)
    )


class SystemHealthSerializer(serializers.Serializer):
    """
    Serializer for system health check
    """
    status = serializers.CharField()
    database = serializers.DictField()
    cache = serializers.DictField()
    celery = serializers.DictField()
    storage = serializers.DictField()
    paypal = serializers.DictField()
    memory_usage = serializers.DictField()
    cpu_usage = serializers.FloatField()
    disk_usage = serializers.DictField()
    last_backup = serializers.DateTimeField()
    error_rate = serializers.FloatField()
    response_time = serializers.FloatField() 