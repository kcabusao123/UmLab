from django.urls import path
from . import views

urlpatterns = [
    # Page views
    path('', views.schedule_page, name='schedule'),
    path('add/', views.schedule_add_page, name='schedule_add'),
    path('edit/<int:pk>/', views.schedule_edit_page, name='schedule_edit'),

    # JSON API endpoints
    path('api/', views.api_schedule_list, name='api_schedule_list'),
    path('api/<int:pk>/', views.api_schedule_detail, name='api_schedule_detail'),
]
