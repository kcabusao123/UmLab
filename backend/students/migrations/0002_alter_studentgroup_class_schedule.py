# Manually created migration.
# Fixes schedule choices from ('mtw'/'thfs') to ('mon-wed'/'thur-sat') so they
# match Schedule.SCHEDULE_CHOICES and the student-add auto-fill works correctly.
# Also widens max_length from 10 → 20 to be consistent with schedule_schedule.
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studentgroup',
            name='class_schedule',
            field=models.CharField(
                choices=[
                    ('mon-wed',  'Monday to Wednesday'),
                    ('thur-sat', 'Thursday to Saturday'),
                ],
                max_length=20,
            ),
        ),
    ]
