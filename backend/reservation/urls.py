from django.urls import path
from . import views

urlpatterns = [
    # Page view
    path('', views.reservation_page, name='reservation'),

    # JSON API endpoints
    path('api/', views.api_reservation_list, name='api_reservation_list'),
    path('api/<int:pk>/', views.api_reservation_detail, name='api_reservation_detail'),
    path('api/<int:pk>/approve/', views.api_reservation_approve, name='api_reservation_approve'),
]
