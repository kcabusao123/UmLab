from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='attendance',
            name='marked_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
