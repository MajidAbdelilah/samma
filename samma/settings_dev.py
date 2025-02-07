from .settings import *

# Set language to English
LANGUAGE_CODE = 'en'

# Use SQLite for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Use console email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Use dummy cache for development
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Disable celery tasks during development
CELERY_ALWAYS_EAGER = True
CELERY_EAGER_PROPAGATES_EXCEPTIONS = True

# Use local storage for development
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

# PayPal test settings
PAYPAL_MODE = 'sandbox'
PAYPAL_CLIENT_ID = 'test_client_id'
PAYPAL_CLIENT_SECRET = 'test_client_secret' 