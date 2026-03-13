from django.contrib import admin
from .models import StudentGroup


@admin.register(StudentGroup)
class StudentGroupAdmin(admin.ModelAdmin):
    list_display = ['class_code', 'teacher_name', 'class_schedule', 'class_time_in', 'course']
    list_filter = ['class_schedule']
    search_fields = ['teacher_name', 'class_code', 'course']
