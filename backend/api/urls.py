from django.urls import path
from . import views

urlpatterns = [
    path("schema/", views.SchemaList.as_view(), name="get-schema"),
    path("schema/create", views.SchemaCreate.as_view(), name="create-schema"),
    path("schema/<str:name>", views.SchemaDetail.as_view(), name="get-schema"),
    path("schema/delete/<str:name>", views.SchemaDelete.as_view(), name="delete-schema"),
]
