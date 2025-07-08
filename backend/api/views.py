from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny, SAFE_METHODS
from .models import Schema, Product
from .serializers import SchemaSerializer, ProductSerializer
from .permissions import ReadOnlyOrAdmin

from .utils import generate_bom_from_yaml, export_bom_to_excel
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# Generate BOM
@api_view(["POST"])
def download_bom(request, name):
    schema = get_object_or_404(Schema, name=name)

    answers = request.data.get("answers", {})
    if not isinstance(answers, dict):
        return Response({"error": "Missing or invalid 'answers'"}, status=400)

    try:
        bom = generate_bom_from_yaml(schema.yaml, answers)
        excel_bytes = export_bom_to_excel(bom)

        response = HttpResponse(
            excel_bytes,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = f'attachment; filename="{schema.name}-bom.xlsx"'
        return response

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Schemas
class SchemaList(generics.ListAPIView):
    queryset = Schema.objects.all()
    serializer_class = SchemaSerializer
    permission_classes = [ReadOnlyOrAdmin]

class SchemaDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Schema.objects.all()
    serializer_class = SchemaSerializer
    lookup_field = "name"
    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]

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

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = "sku"
    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]

class ProductCreate(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]

class ProductDelete(generics.DestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "sku"
