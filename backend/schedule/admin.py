from django.contrib import admin
from .models import Schedule


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['teacher_name', 'class_code', 'room', 'class_time_in', 'class_time_out', 'status']
    list_filter = ['status', 'class_schedule']
    search_fields = ['teacher_name', 'class_code', 'course']
