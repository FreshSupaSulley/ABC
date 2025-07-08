import yaml
from django.core.exceptions import ValidationError
from django.db import models
from django.core.validators import RegexValidator
import textwrap

DEFAULT_YAML = textwrap.dedent("""questions:
- name: num_racks
  type: integer
  prompt: "How many racks?"
  default: 2

- name: include_mgmt_aggs
  type: boolean
  prompt: "Include management AGGs?"
  default: false

- name: support_years
  type: enum
  prompt: "How many years of support?"
  choices: [1, 3, 5]
  default: 3

rules:
- condition: "num_racks > 2"
  add:
    product: "DCS-7280CR3A-48D6-R"
    quantity: "num_racks * 2"

- condition: "include_mgmt_aggs == true"
  add:
    product: "MGMT-AGG-SWITCH"
    quantity: 1

- condition: "support_years == 5"
  add:
    product: "A-Care-5YR"
    quantity: "num_racks * 2"
""")

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
    yaml = models.TextField(default=DEFAULT_YAML)
    parsed_questions = models.JSONField(default=list, blank=True) # store the questions too. Updates when YAML does
    
    def clean(self):
        # Validate YAML format and structure
        try:
            parsed = yaml.safe_load(self.yaml_text)
        except yaml.YAMLError as e:
            raise ValidationError({'yaml_text': f"Invalid YAML: {str(e)}"})

        if not isinstance(parsed, dict) or 'questions' not in parsed:
            raise ValidationError({'yaml_text': "YAML must contain a 'questions' key."})

        questions = parsed['questions']
        if not isinstance(questions, list):
            raise ValidationError({'yaml_text': "'questions' must be a list."})

        for i, q in enumerate(questions):
            if not isinstance(q, dict):
                raise ValidationError({'yaml_text': f"Question at index {i} is not a dict."})
            for field in ['name', 'type', 'prompt']:
                if field not in q:
                    raise ValidationError({'yaml_text': f"Missing '{field}' in question at index {i}."})

        # If we get here, YAML is valid
        self.parsed_questions = questions

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
