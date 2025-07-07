from django.contrib import admin
from .models import Schema, Product

@admin.register(Schema)
class SchemaAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('sku', 'classification', 'gpl_price')
    list_filter = ('classification',)
    search_fields = ('sku', 'description')
