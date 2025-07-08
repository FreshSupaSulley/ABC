from rest_framework import serializers
from .models import Schema, Product
import yaml

class SchemaSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    class Meta:
        model = Schema
        fields = ['name', 'description', 'yaml', 'questions']
    def get_questions(self, obj):
        try:
            parsed = yaml.safe_load(obj.yaml)
            if not isinstance(parsed, dict):
                return []
            return parsed.get('questions', [])
        except yaml.YAMLError:
            return []
    def validate_yaml(self, value):
        try:
            parsed = yaml.safe_load(value)
            if not isinstance(parsed, dict) or 'questions' not in parsed:
                raise serializers.ValidationError("YAML must contain a 'questions' list.")
        except yaml.YAMLError as e:
            raise serializers.ValidationError(f"YAML error: {str(e)}")
        return value

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
