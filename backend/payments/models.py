from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator


class Payment(models.Model):
    """
    Model for handling payments between buyers and sellers
    """
    PAYMENT_STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
        ('refunded', _('Refunded')),
    ]

    # Payment details
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='payments_made',
        verbose_name=_('buyer')
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='payments_received',
        verbose_name=_('seller')
    )
    game = models.ForeignKey(
        'games.Game',
        on_delete=models.PROTECT,
        related_name='payments',
        verbose_name=_('game')
    )
    
    # Payment information
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(
        _('platform fee'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    seller_amount = models.DecimalField(
        _('seller amount'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    
    # PayPal specific fields
    paypal_transaction_id = models.CharField(_('PayPal transaction ID'), max_length=100)
    paypal_payer_id = models.CharField(_('PayPal payer ID'), max_length=100)
    paypal_payment_id = models.CharField(_('PayPal payment ID'), max_length=100)
    
    # Status and tracking
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    is_platform_fee_paid = models.BooleanField(_('is platform fee paid'), default=False)
    is_seller_paid = models.BooleanField(_('is seller paid'), default=False)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)

    class Meta:
        verbose_name = _('payment')
        verbose_name_plural = _('payments')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['buyer']),
            models.Index(fields=['seller']),
        ]

    def __str__(self):
        return f'Payment {self.id} - {self.game.title}'

    def calculate_amounts(self):
        """
        Calculate platform fee and seller amount based on game price and bid percentage
        """
        bid_percentage = self.game.bid_percentage
        total_fee_percentage = bid_percentage
        
        self.platform_fee = (self.amount * total_fee_percentage) / 100
        self.seller_amount = self.amount - self.platform_fee

    def save(self, *args, **kwargs):
        if not self.platform_fee or not self.seller_amount:
            self.calculate_amounts()
        super().save(*args, **kwargs)


class Transaction(models.Model):
    """
    Model for tracking all financial transactions in the platform
    """
    TRANSACTION_TYPE_CHOICES = [
        ('purchase', _('Purchase')),
        ('refund', _('Refund')),
        ('platform_fee', _('Platform Fee')),
        ('seller_payment', _('Seller Payment')),
    ]

    payment = models.ForeignKey(
        Payment,
        on_delete=models.PROTECT,
        related_name='transactions',
        verbose_name=_('payment')
    )
    transaction_type = models.CharField(
        _('transaction type'),
        max_length=20,
        choices=TRANSACTION_TYPE_CHOICES
    )
    amount = models.DecimalField(_('amount'), max_digits=10, decimal_places=2)
    paypal_transaction_id = models.CharField(_('PayPal transaction ID'), max_length=100)
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=Payment.PAYMENT_STATUS_CHOICES,
        default='pending'
    )
    notes = models.TextField(_('notes'), blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('transaction')
        verbose_name_plural = _('transactions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['transaction_type']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'{self.transaction_type} - {self.payment}'
