from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .models import Schema, Product
from .serializers import SchemaSerializer, ProductSerializer
from .permissions import ReadOnlyOrAdmin

# Schemas
class SchemaList(generics.ListAPIView):
    queryset = Schema.objects.all()
    serializer_class = SchemaSerializer
    permission_classes = [ReadOnlyOrAdmin]

class SchemaDetail(generics.RetrieveAPIView):
    queryset = Schema.objects.all()
    serializer_class = SchemaSerializer
    permission_classes = [ReadOnlyOrAdmin]
    lookup_field = "name"

class SchemaCreate(generics.ListCreateAPIView):
    queryset = Schema.objects.all()
    serializer_class = SchemaSerializer
    permission_classes = [IsAdminUser]

class SchemaDelete(generics.DestroyAPIView):
    queryset = Schema.objects.all()
    serializer_class = SchemaSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "name"

# Products
# Only admins need to concern themselves with products
class ProductList(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

class ProductDetail(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "name"

class ProductCreate(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

class ProductDelete(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "name"
