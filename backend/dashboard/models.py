from django.db import models


class Attendance(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('present', 'Present'),
        ('absent', 'Absent'),
    ]

    schedule = models.ForeignKey(
        'schedule.Schedule',
        on_delete=models.CASCADE,
        related_name='attendances',
    )
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    marked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('schedule', 'date')
        ordering = ['-date']

    def to_dict(self):
        return {
            'id':          self.pk,
            'schedule_id': self.schedule_id,
            'date':        self.date.isoformat(),
            'status':      self.status,
            'total_hours': str(self.total_hours),
        }

    def __str__(self):
        return f"{self.schedule} | {self.date} | {self.status}"
