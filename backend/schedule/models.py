from django.db import models
from datetime import time as dt_time


class Schedule(models.Model):
    SCHEDULE_CHOICES = [
        ('mon-wed', 'Monday to Wednesday'),
        ('thur-sat', 'Thursday to Saturday'),
    ]
    STATUS_CHOICES = [
        ('official', 'Official'),
        ('tentative', 'Tentative'),
    ]
    ROOM_DISPLAY = {
        'room1': 'BE 105',
        'room2': 'BE 106',
    }

    room = models.CharField(max_length=50)
    teacher_name = models.CharField(max_length=200)
    class_time_in = models.TimeField()
    class_time_out = models.TimeField()
    class_schedule = models.CharField(max_length=20, choices=SCHEDULE_CHOICES)
    class_code = models.CharField(max_length=50)
    course = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='tentative')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['class_time_in']

    @property
    def session(self):
        """Derive session from class_time_in.
        Morning:   before 12:00
        Afternoon: 12:00 – 17:29
        Evening:   17:30 and after
        """
        t = self.class_time_in
        if t < dt_time(12, 0):
            return 'morning'
        if t < dt_time(17, 30):
            return 'afternoon'
        return 'evening'

    def to_dict(self):
        return {
            'id': self.pk,
            'room': self.room,
            'room_display': self.ROOM_DISPLAY.get(self.room, self.room),
            'teacher_name': self.teacher_name,
            'class_time_in': self.class_time_in.strftime('%H:%M'),
            'class_time_out': self.class_time_out.strftime('%H:%M'),
            'class_time_display': (
                f"{self.class_time_in.strftime('%I:%M %p')} – "
                f"{self.class_time_out.strftime('%I:%M %p')}"
            ),
            'class_schedule': self.class_schedule,
            'class_schedule_display': self.get_class_schedule_display(),
            'class_code': self.class_code,
            'course': self.course,
            'status': self.status,
            'status_display': self.get_status_display(),
            'session': self.session,
        }

    def __str__(self):
        return f"{self.teacher_name} – {self.class_code}"
