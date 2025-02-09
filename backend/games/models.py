from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify


class Category(models.Model):
    """
    Model for game categories (e.g., Action, RPG, Strategy)
    """
    name = models.CharField(_('name'), max_length=100)
    slug = models.SlugField(_('slug'), unique=True)
    description = models.TextField(_('description'), blank=True)
    icon = models.ImageField(_('icon'), upload_to='category_icons/', null=True, blank=True)
    
    class Meta:
        verbose_name = _('category')
        verbose_name_plural = _('categories')
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Tag(models.Model):
    """
    Model for game tags (e.g., Multiplayer, VR, Indie)
    """
    name = models.CharField(_('name'), max_length=50)
    slug = models.SlugField(_('slug'), unique=True)

    class Meta:
        verbose_name = _('tag')
        verbose_name_plural = _('tags')
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Game(models.Model):
    """
    Model for game listings
    """
    # Basic Information
    title = models.CharField(_('title'), max_length=200)
    slug = models.SlugField(_('slug'), unique=True, blank=True)
    description = models.TextField(_('description'))
    price = models.DecimalField(
        _('price'), 
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    bid_percentage = models.DecimalField(
        _('commission rate'),
        max_digits=5,
        decimal_places=2,
        default=5.00,
        validators=[MinValueValidator(5), MaxValueValidator(100)],
        help_text=_('Commission rate percentage (minimum 5%)')
    )
    
    # Ratings and Stats
    rating = models.DecimalField(
        _('rating'),
        max_digits=3,
        decimal_places=1,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    total_ratings = models.PositiveIntegerField(
        _('total ratings'),
        default=0
    )
    total_sales = models.PositiveIntegerField(
        _('total sales'),
        default=0
    )
    
    # Relations
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='games',
        verbose_name=_('seller')
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='games',
        verbose_name=_('category')
    )
    
    # Files
    thumbnail = models.ImageField(
        _('thumbnail'), 
        upload_to='game_thumbnails/',
        help_text=_('Main image for the game'),
        null=True,
        blank=True
    )
    game_file = models.FileField(
        _('game file'), 
        upload_to='game_files/',
        help_text=_('Zip file containing the game'),
        null=True,
        blank=True
    )
    
    # Game Details
    version = models.CharField(
        _('version'), 
        max_length=50, 
        default='1.0.0'
    )
    system_requirements = models.JSONField(
        _('system requirements'),
        default=dict,
        help_text=_('Minimum and recommended system requirements'),
        null=True,
        blank=True
    )
    
    # Status
    is_active = models.BooleanField(_('is active'), default=True)
    is_approved = models.BooleanField(_('is approved'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name = _('game')
        verbose_name_plural = _('games')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['slug']),
            models.Index(fields=['seller']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class GameComment(models.Model):
    """
    Model for game comments
    """
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name=_('game')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='game_comments',
        verbose_name=_('user')
    )
    content = models.TextField(_('content'))
    rating = models.PositiveSmallIntegerField(
        _('rating'),
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        null=True,
        blank=True
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name=_('parent comment')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    is_active = models.BooleanField(_('is active'), default=True)

    class Meta:
        verbose_name = _('game comment')
        verbose_name_plural = _('game comments')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['game', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f'Comment by {self.user.username} on {self.game.title}'

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new and self.rating:
            # Update game rating
            game = self.game
            total_ratings = game.comments.filter(rating__isnull=False).count()
            avg_rating = game.comments.filter(rating__isnull=False).aggregate(
                models.Avg('rating'))['rating__avg']
            
            game.rating = avg_rating or 0
            game.total_ratings = total_ratings
            game.save()
