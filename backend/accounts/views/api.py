from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model, authenticate, login, logout
from django.db.models import Count, Sum, Avg
from django.utils.translation import gettext_lazy as _
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils.decorators import method_decorator
from accounts.serializers.user import (
    UserSerializer,
    UserProfileSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserStatisticsSerializer,
    UserRegistrationSerializer,
)
from games.serializers.game import GameListSerializer
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing user instances.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'username'

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)
        return queryset

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """
        Get or update the current user's information
        """
        user = request.user
        if request.method == 'GET':
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)

        serializer = UserUpdateSerializer(
            user,
            data=request.data,
            partial=request.method == 'PATCH'
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class UserProfileAPIView(generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating user profile
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserGamesAPIView(generics.ListAPIView):
    """
    API view for listing user's games
    """
    serializer_class = GameListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.games.all().order_by('-created_at')


class UserStatisticsAPIView(generics.RetrieveAPIView):
    """
    API view for retrieving user statistics
    """
    serializer_class = UserStatisticsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        # Annotate user with statistics
        user.total_games = user.games.count()
        user.total_sales = user.payments_received.filter(
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0
        user.average_rating = user.games.aggregate(
            avg=Avg('rating'))['avg'] or 0
        return user

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)


@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)  # Log the user in after registration
            return Response({
                'message': 'Registration successful',
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'message': 'Please provide both email and password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                login(request, user)
                return Response({
                    'message': 'Login successful',
                    'user': UserProfileSerializer(user).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({
                'message': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK) 