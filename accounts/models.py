from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom user model for Samma platform.
    """
    email = models.EmailField(_('email address'), unique=True)
    profile_picture = models.ImageField(_('profile picture'), upload_to='profile_pictures/', null=True, blank=True)
    bio = models.TextField(_('biography'), max_length=500, blank=True)
    date_of_birth = models.DateField(_('date of birth'), null=True, blank=True)
    phone_number = models.CharField(_('phone number'), max_length=20, blank=True)
    
    # PayPal related fields
    paypal_email = models.EmailField(_('PayPal email'), blank=True)
    
    # Additional fields for seller statistics
    total_sales = models.DecimalField(_('total sales'), max_digits=10, decimal_places=2, default=0)
    total_games = models.PositiveIntegerField(_('total games'), default=0)
    average_rating = models.DecimalField(_('average rating'), max_digits=3, decimal_places=2, default=0)
    
    # Timestamps
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
        ordering = ['-date_joined']

    def __str__(self):
        return self.username

    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        """
        full_name = f"{self.first_name} {self.last_name}"
        return full_name.strip()

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name

    def update_statistics(self):
        """
        Update user statistics (total_sales, total_games, average_rating)
        This method will be called after relevant changes in games or sales
        """
        from games.models import Game
        from django.db.models import Avg
        
        # Update total games
        self.total_games = Game.objects.filter(seller=self).count()
        
        # Update average rating
        avg_rating = Game.objects.filter(seller=self).aggregate(Avg('rating'))['rating__avg']
        self.average_rating = avg_rating if avg_rating else 0
        
        self.save()
