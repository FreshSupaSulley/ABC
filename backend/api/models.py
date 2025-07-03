from django.db import models
from django.core.validators import RegexValidator

# It's just that easy
class Schema(models.Model):
    name = models.CharField(
        # String as PK im such a badass
        primary_key=True,
        unique=True,
        max_length=100,
        validators=[
            RegexValidator(
                regex=r'^[a-z0-9]+(\.[a-z0-9]+)*$',
                message='Name must be in the format lowercase.lowercase...'
            )
        ]
    )
    description = models.TextField(max_length=200)
    yaml = models.TextField(default="")
    
    def __str__(self):
        return self.name
    