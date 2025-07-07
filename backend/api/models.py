from django.db import models
from django.core.validators import RegexValidator

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

class Product(models.Model):
    class Classification(models.TextChoices):
        HARDWARE = 'hardware', 'Hardware'
        SOFTWARE = 'software', 'Software'
        A_CARE = 'a-care', 'A-Care'
        CVP = 'cvp', 'CVP'
        LICENSES = 'licenses', 'Licenses'
    
    sku = models.CharField(
        max_length=100,
        help_text="Stock keeping unit name"
    )
    description = models.TextField(
        blank=True,
        help_text="Description"
    )
    gpl = models.CharField(
        max_length=20,
        default='pcs',
        help_text="Unit of measure (e.g., pcs, kg, m)"
    )
    classification = models.CharField(
        max_length=20,
        choices=Classification.choices,
        help_text="Product classification"
    )
    # Optional?
    gpl_price = models.DecimalField(
        max_digits=10, # should be plenty (inflation may say otherwise)
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Optional GPL (Global Price List) price"
    )
    def __str__(self):
        return self.sku
