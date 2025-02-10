import pytest
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from games.models import Game, GameVersion
import magic
import os

pytestmark = pytest.mark.django_db


class TestFileUpload:
    def test_valid_game_file_upload(self, auth_client, game):
        """Test uploading a valid game file"""
        url = reverse('api:games:game-version-list', kwargs={'game_slug': game.slug})
        
        # Create a test zip file
        file_content = b'PK\x03\x04' + b'\x00' * 26  # Basic ZIP file header
        game_file = SimpleUploadedFile(
            'game.zip',
            file_content,
            content_type='application/zip'
        )

        data = {
            'version': '1.0.0',
            'release_notes': 'Test release',
            'game_file': game_file
        }

        response = auth_client.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_201_CREATED
        assert GameVersion.objects.filter(game=game).count() == 1

    def test_invalid_file_type(self, auth_client, game):
        """Test uploading a file with invalid type"""
        url = reverse('api:games:game-version-list', kwargs={'game_slug': game.slug})
        
        # Create a text file disguised as zip
        file_content = b'This is not a zip file'
        game_file = SimpleUploadedFile(
            'game.zip',
            file_content,
            content_type='application/zip'
        )

        data = {
            'version': '1.0.0',
            'release_notes': 'Test release',
            'game_file': game_file
        }

        response = auth_client.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'invalid file type' in str(response.data).lower()

    def test_file_size_limit(self, auth_client, game):
        """Test file size limit enforcement"""
        url = reverse('api:games:game-version-list', kwargs={'game_slug': game.slug})
        
        # Create a large file
        file_content = b'0' * (100 * 1024 * 1024 + 1)  # Exceeds 100MB limit
        game_file = SimpleUploadedFile(
            'game.zip',
            file_content,
            content_type='application/zip'
        )

        data = {
            'version': '1.0.0',
            'release_notes': 'Test release',
            'game_file': game_file
        }

        response = auth_client.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'file size' in str(response.data).lower()

    def test_malicious_file_detection(self, auth_client, game):
        """Test detection of potentially malicious files"""
        url = reverse('api:games:game-version-list', kwargs={'game_slug': game.slug})
        
        # Create a file with executable content
        file_content = b'#!/bin/bash\necho "malicious code"'
        game_file = SimpleUploadedFile(
            'game.zip',
            file_content,
            content_type='application/zip'
        )

        data = {
            'version': '1.0.0',
            'release_notes': 'Test release',
            'game_file': game_file
        }

        response = auth_client.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'invalid file' in str(response.data).lower()

    def test_concurrent_uploads(self, auth_client, game):
        """Test handling of concurrent uploads"""
        url = reverse('api:games:game-version-list', kwargs={'game_slug': game.slug})
        
        file_content = b'PK\x03\x04' + b'\x00' * 26
        game_file = SimpleUploadedFile(
            'game.zip',
            file_content,
            content_type='application/zip'
        )

        data = {
            'version': '1.0.0',
            'release_notes': 'Test release',
            'game_file': game_file
        }

        # Simulate concurrent uploads
        response1 = auth_client.post(url, data, format='multipart')
        response2 = auth_client.post(url, data, format='multipart')

        assert response1.status_code == status.HTTP_201_CREATED
        assert response2.status_code == status.HTTP_400_BAD_REQUEST
        assert 'version already exists' in str(response2.data).lower()

    def test_file_integrity(self, auth_client, game):
        """Test uploaded file integrity verification"""
        url = reverse('api:games:game-version-list', kwargs={'game_slug': game.slug})
        
        # Create a corrupted zip file
        file_content = b'PK\x03\x04' + b'corrupted content'
        game_file = SimpleUploadedFile(
            'game.zip',
            file_content,
            content_type='application/zip'
        )

        data = {
            'version': '1.0.0',
            'release_notes': 'Test release',
            'game_file': game_file
        }

        response = auth_client.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'invalid file' in str(response.data).lower()

    def test_mime_type_verification(self, auth_client, game):
        """Test MIME type verification of uploaded files"""
        url = reverse('api:games:game-version-list', kwargs={'game_slug': game.slug})
        
        # Create a file with incorrect MIME type
        file_content = b'<?php echo "hack attempt"; ?>'
        game_file = SimpleUploadedFile(
            'game.php',
            file_content,
            content_type='application/zip'
        )

        data = {
            'version': '1.0.0',
            'release_notes': 'Test release',
            'game_file': game_file
        }

        response = auth_client.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'invalid file type' in str(response.data).lower()

    def test_filename_sanitization(self, auth_client, game):
        """Test sanitization of uploaded filenames"""
        url = reverse('api:games:game-version-list', kwargs={'game_slug': game.slug})
        
        # Create a file with potentially malicious filename
        file_content = b'PK\x03\x04' + b'\x00' * 26
        game_file = SimpleUploadedFile(
            '../../../etc/passwd',
            file_content,
            content_type='application/zip'
        )

        data = {
            'version': '1.0.0',
            'release_notes': 'Test release',
            'game_file': game_file
        }

        response = auth_client.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'invalid filename' in str(response.data).lower()

    def test_empty_file_upload(self, auth_client, game):
        """Test handling of empty file uploads"""
        url = reverse('api:games:game-version-list', kwargs={'game_slug': game.slug})
        
        # Create an empty file
        game_file = SimpleUploadedFile(
            'game.zip',
            b'',
            content_type='application/zip'
        )

        data = {
            'version': '1.0.0',
            'release_notes': 'Test release',
            'game_file': game_file
        }

        response = auth_client.post(url, data, format='multipart')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'empty file' in str(response.data).lower()
