from rest_framework import viewsets, generics, permissions, filters, status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from games.models import Game, Category, Tag, GameComment
from games.serializers.game import (
    GameListSerializer,
    GameDetailSerializer,
    GameCreateSerializer,
    GameUpdateSerializer,
    GameStatisticsSerializer,
    CategorySerializer,
    TagSerializer,
    GameCommentSerializer,
)
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.seller == request.user


class IsCommentOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a comment to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing category instances.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()


class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing tag instances.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()


class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    lookup_field = 'slug'
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'create':
            return GameCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return GameUpdateSerializer
        elif self.action == 'list':
            return GameListSerializer
        return GameDetailSerializer

    def get_queryset(self):
        """
        Return games based on user and action:
        - For list/retrieve: Return approved games + user's own games if authenticated
        - For update/delete: Only allow owner's games
        - For other actions: Only show user's games
        """
        base_queryset = Game.objects.filter(is_active=True)
        
        if self.action in ['list', 'retrieve']:
            if self.request.user.is_authenticated:
                # Show approved games + user's own games
                return base_queryset.filter(
                    Q(is_approved=True) | Q(seller=self.request.user)
                ).distinct()
            # Show only approved games to anonymous users
            return base_queryset.filter(is_approved=True)
            
        elif self.action in ['update', 'partial_update', 'destroy']:
            game_slug = self.kwargs.get('slug')
            game = Game.objects.filter(slug=game_slug).first()
            if game and game.seller != self.request.user:
                self.permission_denied(
                    self.request,
                    message="You do not have permission to modify this game."
                )
            return Game.objects.filter(slug=game_slug)
            
        # For other actions, show only user's games
        return base_queryset.filter(seller=self.request.user)

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    @action(detail=False, methods=['get'], url_path='my-games', url_name='my_games', permission_classes=[IsAuthenticated])
    def my_games(self, request):
        """
        List games owned by the current user
        """
        queryset = Game.objects.filter(seller=request.user, is_active=True)
        serializer = GameListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, slug=None):
        """
        Approve a game (admin only)
        """
        if not request.user.is_staff:
            return Response(
                {"detail": _("You do not have permission to perform this action.")},
                status=status.HTTP_403_FORBIDDEN
            )
        
        game = self.get_object()
        game.is_approved = True
        game.save()
        return Response({"status": "game approved"})


class GameCommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing game comments.
    """
    queryset = GameComment.objects.all()
    serializer_class = GameCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCommentOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['game']
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get_queryset(self):
        if self.action == 'list':
            return GameComment.objects.filter(parent=None).order_by('-created_at')
        return GameComment.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Create a new comment
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GameSearchAPIView(generics.ListAPIView):
    """
    API view for searching games with advanced filters
    """
    serializer_class = GameListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'tags', 'price']
    search_fields = ['title', 'description', 'seller__username']
    ordering_fields = ['created_at', 'price', 'rating', 'total_sales', 'ad_score']
    ordering = ['-ad_score']

    def get_queryset(self):
        queryset = Game.objects.filter(is_active=True, is_approved=True)
        
        # Price range filter
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price is not None:
            queryset = queryset.filter(price__gte=min_price)
        if max_price is not None:
            queryset = queryset.filter(price__lte=max_price)
        
        # Rating filter
        min_rating = self.request.query_params.get('min_rating', None)
        if min_rating is not None:
            queryset = queryset.filter(rating__gte=min_rating)
        
        return queryset


class TopGamesAPIView(generics.ListAPIView):
    """
    API view for listing top games based on various metrics
    """
    serializer_class = GameListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        metric = self.request.query_params.get('metric', 'rating')
        time_frame = self.request.query_params.get('time_frame', 'all')
        
        queryset = Game.objects.filter(is_active=True, is_approved=True)
        
        # Apply time frame filter
        if time_frame != 'all':
            if time_frame == 'today':
                start_date = timezone.now().date()
            elif time_frame == 'week':
                start_date = timezone.now().date() - timezone.timedelta(days=7)
            elif time_frame == 'month':
                start_date = timezone.now().date() - timezone.timedelta(days=30)
            queryset = queryset.filter(created_at__date__gte=start_date)
        
        # Apply metric ordering
        if metric == 'rating':
            queryset = queryset.order_by('-rating', '-total_ratings')
        elif metric == 'sales':
            queryset = queryset.order_by('-total_sales')
        elif metric == 'revenue':
            queryset = queryset.annotate(
                revenue=Sum('payments__amount', filter=Q(payments__status='completed'))
            ).order_by('-revenue')
        
        return queryset[:10]


class GameStatisticsAPIView(generics.RetrieveAPIView):
    """
    API view for retrieving game statistics
    """
    serializer_class = GameStatisticsSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        if self.request.user.is_staff:
            return Game.objects.all()
        return Game.objects.filter(seller=self.request.user)


class UpdateGameBidAPIView(generics.UpdateAPIView):
    """
    API view for updating game bid percentage
    """
    serializer_class = GameUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    lookup_field = 'pk'

    def get_queryset(self):
        return Game.objects.filter(seller=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Only allow updating bid_percentage
        data = {'bid_percentage': request.data.get('bid_percentage')}
        
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data) 