from django.contrib import admin
from .models import Equipment


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display  = ('name', 'lab', 'available_quantity')
    list_filter   = ('lab',)
    search_fields = ('name',)
