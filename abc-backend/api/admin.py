from django.contrib import admin
from .models import *

# admin.sites.register(PatternGroup)
# admin.sites.register(Pattern)
# admin.sites.register(Product)

# @admin.register(Pattern)
# class PatternGroupAdmin(admin.ModelAdmin):
#     list_display = ('name', 'description')

# @admin.register(Pattern)
# class PatternAdmin(admin.ModelAdmin):
#     list_display = ('description')

# @admin.register(Product)
# class ProductAdmin(admin.ModelAdmin):
#     list_display = ('part', 'description')
#     list_filter = ('manufacturer', 'device_role', 'classification')
#     search_fields = ('part', 'description')
