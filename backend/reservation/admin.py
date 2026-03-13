from django.contrib import admin
from .models import Reservation, ReservationEquipment


class ReservationEquipmentInline(admin.TabularInline):
    model = ReservationEquipment
    extra = 1


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['borrower_name', 'class_code', 'date_of_use', 'room_num', 'status']
    list_filter = ['status']
    search_fields = ['borrower_name', 'teacher_name', 'class_code']
    inlines = [ReservationEquipmentInline]
