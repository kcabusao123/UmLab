from django.contrib import admin
from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['schedule', 'date', 'status', 'total_hours']
    list_filter = ['status', 'date']
    search_fields = ['schedule__teacher_name', 'schedule__class_code']
