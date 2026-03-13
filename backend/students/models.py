from django.db import models
from datetime import time as dt_time


class StudentGroup(models.Model):
    # Must match Schedule.SCHEDULE_CHOICES exactly so auto-fill works correctly.
    SCHEDULE_CHOICES = [
        ('mon-wed',  'Monday to Wednesday'),
        ('thur-sat', 'Thursday to Saturday'),
    ]

    teacher_name = models.CharField(max_length=200)
    class_time_in = models.TimeField()
    class_time_out = models.TimeField()
    class_schedule = models.CharField(max_length=20, choices=SCHEDULE_CHOICES)
    class_code = models.CharField(max_length=50)
    course = models.CharField(max_length=100)
    attendance_file = models.FileField(upload_to='attendance/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['class_time_in']

    @property
    def session(self):
        t = self.class_time_in
        if t < dt_time(12, 0):
            return 'morning'
        if t < dt_time(17, 30):
            return 'afternoon'
        return 'evening'

    def to_dict(self):
        return {
            'id': self.pk,
            'teacher_name': self.teacher_name,
            'class_time_in': self.class_time_in.strftime('%H:%M'),
            'class_time_out': self.class_time_out.strftime('%H:%M'),
            'class_schedule': self.class_schedule,
            'class_schedule_display': self.get_class_schedule_display(),
            'class_code': self.class_code,
            'course': self.course,
            'session': self.session,
            'attendance_file': self.attendance_file.url if self.attendance_file else None,
        }

    def __str__(self):
        return f"{self.class_code} – {self.teacher_name}"
