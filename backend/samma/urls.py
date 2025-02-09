"""
URL configuration for samma project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns
from django.utils.translation import gettext_lazy as _

# API URLs
api_patterns = [
    path('accounts/', include('accounts.urls.api')),
    path('games/', include('games.urls.api', namespace='games')),
    path('payments/', include('payments.urls.api', namespace='payments')),
    path('core/', include('core.urls.api', namespace='core')),
]

# Frontend URLs (with i18n support)
urlpatterns = i18n_patterns(
    path(_('admin/'), admin.site.urls),
    path('', include('core.urls.frontend')),
    path(_('accounts/'), include('accounts.urls.frontend')),
    path(_('games/'), include('games.urls.frontend')),
    path(_('payments/'), include('payments.urls.frontend')),
    
    # Third-party URLs
    path('accounts/', include('allauth.urls')),
    
    # API URLs
    path('api/v1/', include((api_patterns, 'api'), namespace='api')),
    
    prefix_default_language=False
)

# Add static and media URLs for development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Add debug toolbar URLs
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]
