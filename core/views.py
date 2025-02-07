from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

# Create your views here.

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint to verify the API is running.
    """
    return Response({'status': 'healthy'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def system_info(request):
    """
    System information endpoint to get version and environment details.
    """
    return Response({
        'version': '1.0.0',
        'environment': 'development',
    }, status=status.HTTP_200_OK)
