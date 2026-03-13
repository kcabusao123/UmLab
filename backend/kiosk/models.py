from django.db import models


class Equipment(models.Model):
    LAB_CHOICES = [
        ('physics',    'Physics'),
        ('biology',    'Biology'),
        ('civil',      'Civil'),
        ('chemistry',  'Chemistry'),
        ('culinary',   'Culinary'),
        ('electrical', 'Electrical'),
        ('mechanical', 'Mechanical'),
        ('hydraulic',  'Hydraulic'),
    ]

    name               = models.CharField(max_length=200)
    lab                = models.CharField(max_length=50, choices=LAB_CHOICES)
    image              = models.ImageField(upload_to='equipment/', null=True, blank=True)
    available_quantity = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['name']

    def to_dict(self):
        return {
            'id':                 self.pk,
            'name':               self.name,
            'lab':                self.lab,
            'image':              self.image.url if self.image else None,
            'available_quantity': self.available_quantity,
        }

    def __str__(self):
        return f"{self.name} ({self.get_lab_display()})"
