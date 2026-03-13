from django.urls import path
from . import views

urlpatterns = [
    # Page views
    path('', views.student_page, name='students'),
    path('add/', views.student_add_page, name='student_add'),

    # JSON API endpoints
    path('api/', views.api_student_list, name='api_student_list'),
    path('api/<int:pk>/', views.api_student_detail, name='api_student_detail'),
]
