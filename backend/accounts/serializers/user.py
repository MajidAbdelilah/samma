from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model with basic information
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model with detailed profile information
    """
    total_games = serializers.IntegerField(read_only=True)
    total_sales = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users
    """
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def create(self, validated_data):
        """
        Create and return a new user
        """
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information
    """
    current_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False, min_length=8)
    confirm_new_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email')

    def validate(self, data):
        """
        Validate the password change if requested
        """
        if 'new_password' in data or 'confirm_new_password' in data:
            if not data.get('current_password'):
                raise serializers.ValidationError(
                    {"current_password": _("Current password is required to set a new password")}
                )
            if not self.instance.check_password(data.get('current_password')):
                raise serializers.ValidationError(
                    {"current_password": _("Current password is incorrect")}
                )
            if data.get('new_password') != data.get('confirm_new_password'):
                raise serializers.ValidationError(
                    {"confirm_new_password": _("New passwords do not match")}
                )

        return data

    def update(self, instance, validated_data):
        """
        Update and return an existing user
        """
        # Remove password fields from validated data
        validated_data.pop('current_password', None)
        new_password = validated_data.pop('new_password', None)
        validated_data.pop('confirm_new_password', None)

        # Update the password if provided
        if new_password:
            instance.set_password(new_password)

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class UserStatisticsSerializer(serializers.ModelSerializer):
    """
    Serializer for user statistics
    """
    total_games = serializers.IntegerField()
    total_sales = serializers.DecimalField(max_digits=10, decimal_places=2)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)

    class Meta:
        model = User
        fields = ('id', 'username', 'total_games', 'total_sales', 'average_rating')
        read_only_fields = fields


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }
    
    def create(self, validated_data):
        """
        Create and return a new user
        """
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user 