from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.views.generic import RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', RedirectView.as_view(url='/kiosk/', permanent=False)),
    path('signin/', include('core.urls')),
    path('dashboard/', include('dashboard.urls')),
    path('schedule/', include('schedule.urls')),
    path('reservation/', include('reservation.urls')),
    path('students/', include('students.urls')),
    path('kiosk/',    include('kiosk.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
