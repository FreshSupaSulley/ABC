from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Schema

# THIS IS PYTHON -> JSON
# We are serializing the data from the DB to JSON for the API call
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}
    
    # This can be thought of as the deserializer
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class SchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schema
        fields = '__all__'
        