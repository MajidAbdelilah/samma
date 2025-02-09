from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from games.models import Game, Category, Tag, GameComment
from accounts.serializers.user import UserSerializer
from django.db import models


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for the Category model
    """
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'icon')
        read_only_fields = ('id', 'slug')


class TagSerializer(serializers.ModelSerializer):
    """
    Serializer for the Tag model
    """
    class Meta:
        model = Tag
        fields = ('id', 'name', 'slug')
        read_only_fields = ('id', 'slug')


class GameCommentSerializer(serializers.ModelSerializer):
    """
    Serializer for the GameComment model
    """
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = GameComment
        fields = (
            'id', 'game', 'user', 'content', 'rating',
            'parent', 'replies', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def get_replies(self, obj):
        """
        Get replies to this comment
        """
        if obj.replies.exists():
            return GameCommentSerializer(obj.replies.all(), many=True).data
        return []

    def validate_rating(self, value):
        """
        Validate rating value
        """
        if value and (value < 1 or value > 10):
            raise serializers.ValidationError(
                _("Rating must be between 1 and 10")
            )
        return value


class GameListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing games with basic information
    """
    seller = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = (
            'id', 'title', 'slug', 'seller', 'price',
            'category', 'tags', 'main_image', 'rating',
            'total_ratings', 'total_sales', 'bid_percentage',
            'ad_score', 'is_active', 'is_approved', 'created_at'
        )
        read_only_fields = (
            'id', 'slug', 'rating', 'total_ratings',
            'total_sales', 'ad_score', 'created_at'
        )


class GameDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for detailed game information
    """
    seller = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = GameCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = (
            'id', 'title', 'slug', 'description', 'seller',
            'price', 'category', 'tags', 'main_image',
            'additional_images', 'version', 'release_date',
            'system_requirements', 'rating', 'total_ratings',
            'total_sales', 'bid_percentage', 'ad_score',
            'is_active', 'is_approved', 'created_at',
            'updated_at', 'comments'
        )
        read_only_fields = (
            'id', 'slug', 'rating', 'total_ratings',
            'total_sales', 'ad_score', 'created_at',
            'updated_at'
        )


class GameCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new games
    """
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category'
    )

    class Meta:
        model = Game
        fields = [
            'title',
            'description',
            'price',
            'category_id',
            'thumbnail',
            'game_file',
            'system_requirements',
        ]

    def validate_system_requirements(self, value):
        """
        Validate system requirements format
        """
        if not isinstance(value, dict):
            raise serializers.ValidationError(_("System requirements must be an object"))

        required_sections = {'minimum', 'recommended'}
        if not all(section in value for section in required_sections):
            raise serializers.ValidationError(
                _("Both 'minimum' and 'recommended' sections are required")
            )

        required_fields = {'os', 'processor', 'memory', 'graphics', 'storage'}
        for section in required_sections:
            if not isinstance(value[section], dict):
                raise serializers.ValidationError(
                    _(f"'{section}' must be an object")
                )
            
            missing_fields = required_fields - set(value[section].keys())
            if missing_fields:
                raise serializers.ValidationError(
                    _(f"Missing required fields in {section}: {', '.join(missing_fields)}")
                )

        return value

    def validate_price(self, value):
        """
        Validate price is positive
        """
        if value <= 0:
            raise serializers.ValidationError(_("Price must be greater than 0"))
        return value

    def validate(self, data):
        """
        Additional validation
        """
        if not data.get('thumbnail'):
            raise serializers.ValidationError({
                'thumbnail': _("Thumbnail image is required")
            })
        
        if not data.get('game_file'):
            raise serializers.ValidationError({
                'game_file': _("Game file is required")
            })

        return data


class GameUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating games
    """
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        required=False
    )
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        source='tags',
        many=True,
        required=False
    )

    class Meta:
        model = Game
        fields = (
            'title', 'description', 'price', 'category_id',
            'tag_ids', 'main_image', 'additional_images',
            'game_file', 'version', 'system_requirements',
            'bid_percentage', 'is_active'
        )
        read_only_fields = ('slug',)

    def validate_bid_percentage(self, value):
        """
        Validate bid percentage
        """
        if value < 5.0:
            raise serializers.ValidationError(
                _("Bid percentage must be at least 5%")
            )
        return value


class GameStatisticsSerializer(serializers.ModelSerializer):
    """
    Serializer for game statistics
    """
    revenue = serializers.SerializerMethodField()
    platform_fees = serializers.SerializerMethodField()
    seller_earnings = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = (
            'id', 'title', 'total_sales', 'rating',
            'total_ratings', 'revenue', 'platform_fees',
            'seller_earnings', 'comment_count', 'bid_percentage',
            'ad_score'
        )
        read_only_fields = fields

    def get_revenue(self, obj):
        """
        Get total revenue from game sales
        """
        return obj.payments.filter(status='completed').aggregate(
            total=models.Sum('amount'))['total'] or 0

    def get_platform_fees(self, obj):
        """
        Get total platform fees
        """
        return obj.payments.filter(status='completed').aggregate(
            total=models.Sum('platform_fee'))['total'] or 0

    def get_seller_earnings(self, obj):
        """
        Get total seller earnings
        """
        return obj.payments.filter(status='completed').aggregate(
            total=models.Sum('seller_amount'))['total'] or 0

    def get_comment_count(self, obj):
        """
        Get total number of comments
        """
        return obj.comments.count() 