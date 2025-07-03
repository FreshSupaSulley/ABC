from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .models import Schema
from .serializers import UserSerializer, SchemaSerializer

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class SchemaList(generics.ListAPIView):
    queryset = Schema.objects.all()
    serializer_class = SchemaSerializer

class SchemaDetail(generics.RetrieveAPIView):
    queryset = Schema.objects.all()
    serializer_class = SchemaSerializer
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
