import yaml
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.db import models
from django.core.validators import RegexValidator, MinValueValidator
import textwrap
from .utils import generate_bom_from_yaml

DEFAULT_YAML = textwrap.dedent("""# Questions to ask the product leads
# If you don't need any input from PLs, you can delete questions
questions:
  # 'num_racks' becomes a variable for calculations below
- name: num_racks
  type: integer
  min: 0
  max: 2
  prompt: "How many racks?"
  # Descriptions are optional. They'll appear below the question (prompt) on the build BOM page
  description: "How many racks does your network require?"
  default: 2

- name: power_cables
  type: boolean
  prompt: "Do you need power cables?"
  default: false

- name: support_years
  type: enum
  prompt: "How many years of support?"
  choices: [1, 3, 5]
  default: 3

# Define what goes into the BOM based on user input
# Products are required
products:
  # This product will be added everytime, unconditionally
- add:
    # Note: any products you add MUST already exist in the database.
    # If not, navigate to the products page to add them
    product: "example"
    quantity: 2

  # Use conditions for optional products
  # Conditions are enclosed in double quotes and are evaluated as Python expressions
- condition: "num_racks > 2"
  add:
    product: "example"
    quantity: "num_racks * 2"

  # Python capitalizes booleans!
- condition: "power_cables == True"
  add:
    product: "example"
    # You can either have a fixed quantity...
    quantity: 1

- condition: "support_years == 5"
  add:
    product: "example"
    # ... or a variable amount of items (double quotes denote a Python expression)
    quantity: "num_racks * 2"
""")

class PatternGroup(models.Model):
    name = models.CharField(
        primary_key=True,
        # unique=True,
        max_length=100,
        validators=[
            RegexValidator(
                regex=r'^[a-z0-9]+(\.[a-z0-9]+)*$',
                message='Name must be in the format lowercase.lowercase...'
            )
        ]
    )
    description = models.TextField(max_length=200)

class Pattern(models.Model):
    group = models.ForeignKey(PatternGroup, on_delete=models.CASCADE)
    description = models.TextField(max_length=200, blank=True)
    version = models.PositiveIntegerField(validators=[MinValueValidator(1)], default=1) # 1 (initial) and above
    deprecated = models.BooleanField(default=False) # Determines whether to show / hide from PLs
    yaml = models.TextField(default=DEFAULT_YAML)
    questions = models.JSONField(default=list, blank=True) # store the questions too. Updates when YAML does
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['group', 'version'], name='unique_pattern_version_per_group')
        ]
    
    # This runs when you try to save a pattern (see save() below)
    # It checks to see if the YAML is good to go and is able to generate a BOM
    def clean(self):
        # Validate YAML
        try:
            parsed = yaml.safe_load(self.yaml)
        except yaml.YAMLError as e:
            raise ValidationError({'yaml': f"Invalid YAML: {str(e)}"})
        # Basic structural requires
        if not isinstance(parsed, dict) or 'products' not in parsed:
            raise ValidationError({'yaml': "YAML must contain a 'products' key"})
        # Validate 'products' structure
        products = parsed['products']
        if not isinstance(products, list):
            raise ValidationError({'yaml': "'products' must be a list."})
        # Check each item
        for i, r in enumerate(products):
            # Ensure dict
            if not isinstance(r, dict):
                raise ValidationError({'yaml': f"Item at index #{i + 1} is not a dict"})
            # Check add
            add = r.get('add')
            if not add or not isinstance(add, dict):
                raise ValidationError({"yaml": f"Rule #{i + 1} must have an 'add' dict"})
            # Children in 'add' can be either a raw array, or a product
            # If it's raw
            if 'raw' in add:
                # Ensure it's an array
                raw = add.get("raw")
                if not isinstance(raw, list):
                    raise ValidationError({'yaml': f"'raw' must be an array (got {type(raw).__name__})"})
                elif not raw:
                    raise ValidationError({'yaml': f"'raw' must have at least one element"})
            else:
                # It's a product, so ensure 'product' and 'quantity' are present
                for field in ['product', 'quantity']:
                    if field not in add:
                        raise ValidationError({'yaml': f"Missing '{field}' in 'add' of item #{i + 1}."})
                # Check condition
                condition = r.get('condition')
                if condition and not isinstance(condition, str):
                    raise ValidationError({'yaml': f"'condition' in item #{i + 1} must be a string"})
                # Validate 'product'
                product = add.get('product')
                if not isinstance(product, str):
                    raise ValidationError({'yaml': f"'product' in item #{i + 1} must be a string (got {type(product).__name__})"})
                # Validate 'quantity'
                quantity = add.get('quantity')
                if not isinstance(quantity, str) and not isinstance(quantity, int):
                    raise ValidationError({'yaml': f"'quantity' in item #{i + 1} must be a string or integer (got {type(quantity).__name__})"})
        # Check questions
        questions = parsed.get('questions', [])
        if not isinstance(questions, list):
            raise ValidationError({'yaml': "'questions' must be a list."})
        # Store default answers for testing
        defaults = {}
        for i, q in enumerate(questions):
            if not isinstance(q, dict):
                raise ValidationError({'yaml': f"Question at index #{i + 1} is not a dict"})
            # Required fields in each question
            for field in ['name', 'type', 'prompt', 'default']:
                if field not in q:
                    raise ValidationError({'yaml': f"Missing '{field}' in question #{i + 1}"})
            # Add default answers to a temp list for testing
            defaults[q.get('name')] = q.get('default')
        # Now for a more definitive test, see if BOM creation actually works
        try:
            # This will throw errors if answers are malformed, not YAML
            generate_bom_from_yaml(self.group.name, self.yaml, defaults, False) # False indicates this is a save action, not a PDF generation (meaning it won't throw a "BOM is empty" error)
        except Exception as error:
            print(error)
            raise ValidationError({"error": str(error)})
        # If that didn't throw an error, we're good to save
        self.questions = questions
    
    def save(self, *args, **kwargs):
        # Ensure clean is called before saving
        self.clean()
        super(Pattern, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.group.name} - Version {self.version}"

class Manufacturer(models.Model):
    name = models.CharField(
        primary_key=True,
        max_length=100
    )
    def __str__(self):
        return self.name

class Classification(models.Model):
    name = models.CharField(
        primary_key=True,
        max_length=50
    )
    def __str__(self):
        return self.name

class DeviceRole(models.Model):
    name = models.CharField(
        primary_key=True,
        max_length=50
    )
    def __str__(self):
        return self.name

class Product(models.Model):
    # Primary key of products
    part = models.CharField(
        primary_key=True,
        max_length=100,
        help_text="Manufacturer part number"
    )
    description = models.TextField(
        blank=True,
        help_text="Description"
    )
    manufacturer = models.ForeignKey(
        Manufacturer,
        on_delete=models.PROTECT,
        help_text="Manufacturer"
    )
    classification = models.ForeignKey(
        Classification,
        on_delete=models.PROTECT,
        help_text="Product classification"
    )
    end_of_support = models.DateTimeField(null=True, default=None)
    # Optional
    device_role = models.ForeignKey(
        DeviceRole,
        null=True,
        on_delete=models.PROTECT,
        help_text="Device role in network"
    )
    # Optional
    list_price = models.DecimalField(
        null=True,
        max_digits=10, # should be plenty (inflation may say otherwise)
        decimal_places=2,
        help_text="Optional GPL (Global Price List) price"
    )
    # Optional
    discount = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        null=True,
        help_text="Product discount as decimal"
    )
    def __str__(self):
        return self.part

# Add to admin screen
admin.site.register(PatternGroup)
admin.site.register(Pattern)
admin.site.register(Manufacturer)
admin.site.register(DeviceRole)
admin.site.register(Classification)
admin.site.register(Product)
