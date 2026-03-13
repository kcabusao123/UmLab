from django.urls import path
from . import views

urlpatterns = [
    # Page view
    path('', views.dashboard_page, name='dashboard'),

    # JSON API endpoints
    path('api/', views.api_dashboard, name='api_dashboard'),
    path('api/attendance/<int:pk>/', views.api_attendance_update, name='api_attendance_update'),
]
