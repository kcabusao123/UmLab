from django.urls import path
from . import views

urlpatterns = [
    path('',             views.frontpage_view,      name='kiosk_frontpage'),
    path('lab/',         views.lab_choose_view,      name='kiosk_lab'),
    path('equipment/',   views.pick_equipment_view,  name='kiosk_equipment'),
    path('items/',       views.item_list_view,       name='kiosk_items'),
    path('fillout/',     views.fillout_view,         name='kiosk_fillout'),

    # API
    path('api/equipment/', views.api_equipment_list, name='kiosk_api_equipment'),
    path('api/reserve/',   views.api_kiosk_reserve,  name='kiosk_api_reserve'),
]
