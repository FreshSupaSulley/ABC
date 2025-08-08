from django.urls import path
from . import views
from .views import *

urlpatterns = [
    # BOM
    path("pattern/<str:id>/bom", download_bom),
    # Patterns
    path("pattern", pattern_list_create),
    path("pattern/create", pattern_list_create),
    path("pattern/<str:id>", get_edit_pattern),
    path("pattern/delete/<str:pk>", pattern_group_delete),
    # Products
    path("product", product_list_create),
    path("product/create", product_list_create),
    path("product/<str:pk>", single_product),
    path("product/delete/<str:pk>", single_product),
    # Product fields
    path('manufacturer', ManufacturerListCreateAPIView.as_view(), name='manufacturer-list-create'),
    path('manufacturer/<str:pk>', ManufacturerRetrieveUpdateDestroyAPIView.as_view(), name='manufacturer-detail'),
    path('device-role', DeviceRoleListCreateAPIView.as_view(), name='device-role-list-create'),
    path('device-role/<str:pk>', DeviceRoleRetrieveUpdateDestroyAPIView.as_view(), name='device-role-detail'),
    path('classification', ClassificationListCreateAPIView.as_view(), name='classification-list-create'),
    path('classification/<str:pk>', ClassificationRetrieveUpdateDestroyAPIView.as_view(), name='classification-detail'),
]
