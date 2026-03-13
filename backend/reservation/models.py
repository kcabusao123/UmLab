from django.db import models


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('unapproved', 'Unapproved'),
        ('approved', 'Approved'),
    ]

    borrower_name = models.CharField(max_length=200)
    class_code = models.CharField(max_length=50)
    teacher_name = models.CharField(max_length=200)
    date_filed = models.DateField()
    date_of_use = models.DateField()
    room_num = models.CharField(max_length=50)
    date_of_return = models.DateField()
    course = models.CharField(max_length=100)
    college = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unapproved')
    class_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    class_time = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def to_dict(self):
        return {
            'id': self.pk,
            'borrower_name': self.borrower_name,
            'class_code': self.class_code,
            'teacher_name': self.teacher_name,
            'date_filed': self.date_filed.isoformat() if self.date_filed else None,
            'date_of_use': self.date_of_use.isoformat() if self.date_of_use else None,
            'room_num': self.room_num,
            'date_of_return': self.date_of_return.isoformat() if self.date_of_return else None,
            'course': self.course,
            'college': self.college,
            'status': self.status,
            'class_hours': str(self.class_hours) if self.class_hours is not None else None,
            'class_time': self.class_time,
            'equipment': [eq.to_dict() for eq in self.equipment.all()],
        }

    def __str__(self):
        return f"{self.borrower_name} – {self.date_of_use}"


class ReservationEquipment(models.Model):
    reservation = models.ForeignKey(
        Reservation,
        on_delete=models.CASCADE,
        related_name='equipment',
    )
    name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()

    def to_dict(self):
        return {'id': self.pk, 'name': self.name, 'quantity': self.quantity}

    def __str__(self):
        return f"{self.name} ×{self.quantity}"
