from django.urls import path
from . import views

urlpatterns = [
    # Schema
    path("schema/", views.SchemaList.as_view(), name="list-schema"),
    path("schema/create", views.SchemaCreate.as_view(), name="create-schema"),
    path("schema/<str:name>", views.SchemaDetail.as_view(), name="get-schema"),
    path("schema/delete/<str:name>", views.SchemaDelete.as_view(), name="delete-schema"),
    # Products
    path("product", views.ProductCreate.as_view(), name="list-product"),
    path("product/create", views.ProductCreate.as_view(), name="create-product"),
    path("product/<str:name>", views.ProductDetail.as_view(), name="get-product"),
    path("product/delete/<str:name>", views.ProductDelete.as_view(), name="delete-product"),
]
