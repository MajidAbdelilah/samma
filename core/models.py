from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    """
    Model for user notifications
    """
    NOTIFICATION_TYPES = [
        ('purchase', _('Purchase')),
        ('sale', _('Sale')),
        ('comment', _('Comment')),
        ('rating', _('Rating')),
        ('system', _('System')),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('user')
    )
    notification_type = models.CharField(
        _('notification type'),
        max_length=20,
        choices=NOTIFICATION_TYPES
    )
    title = models.CharField(_('title'), max_length=200)
    message = models.TextField(_('message'))
    data = models.JSONField(_('data'), default=dict, blank=True)
    is_read = models.BooleanField(_('is read'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        verbose_name = _('notification')
        verbose_name_plural = _('notifications')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f'{self.notification_type} - {self.title}'


class AuditLog(models.Model):
    """
    Model for tracking important system events and user actions
    """
    ACTION_TYPES = [
        ('create', _('Create')),
        ('update', _('Update')),
        ('delete', _('Delete')),
        ('payment', _('Payment')),
        ('login', _('Login')),
        ('logout', _('Logout')),
        ('other', _('Other')),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs',
        verbose_name=_('user')
    )
    action = models.CharField(_('action'), max_length=20, choices=ACTION_TYPES)
    model_name = models.CharField(_('model name'), max_length=100)
    object_id = models.CharField(_('object id'), max_length=100)
    object_repr = models.CharField(_('object representation'), max_length=200)
    changes = models.JSONField(_('changes'), default=dict)
    ip_address = models.GenericIPAddressField(_('IP address'), null=True, blank=True)
    user_agent = models.CharField(_('user agent'), max_length=500, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        verbose_name = _('audit log')
        verbose_name_plural = _('audit logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action']),
            models.Index(fields=['model_name']),
        ]

    def __str__(self):
        return f'{self.action} - {self.model_name} - {self.object_repr}'


class SystemConfiguration(models.Model):
    """
    Model for storing system-wide configuration settings
    """
    key = models.CharField(_('key'), max_length=100, unique=True)
    value = models.JSONField(_('value'))
    description = models.TextField(_('description'), blank=True)
    is_public = models.BooleanField(_('is public'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('system configuration')
        verbose_name_plural = _('system configurations')
        ordering = ['key']

    def __str__(self):
        return self.key


class FAQ(models.Model):
    """
    Model for Frequently Asked Questions
    """
    question = models.CharField(_('question'), max_length=500)
    answer = models.TextField(_('answer'))
    category = models.CharField(_('category'), max_length=100)
    order = models.PositiveIntegerField(_('order'), default=0)
    is_active = models.BooleanField(_('is active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('FAQ')
        verbose_name_plural = _('FAQs')
        ordering = ['category', 'order']

    def __str__(self):
        return self.question
