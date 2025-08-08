from rest_framework import serializers
from .models import *
import yaml

class PatternSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()
    pattern_group = serializers.SerializerMethodField() # include pattern group too
    
    class Meta:
        model = Pattern
        exclude = ('group',)
    
    # Although we aren't using these getters directly, Django will look for a getter named after our local variables
    # because we defined variables "questions" and "pattern_group". Same applies to the getter in PatternSummarySerializer
    def get_pattern_group(self, obj):
        return PatternGroupSerializer(obj.group).data
    
    def get_questions(self, obj):
        try:
            parsed = yaml.safe_load(obj.yaml)
            if not isinstance(parsed, dict):
                return []
            return parsed.get('questions', [])
        except yaml.YAMLError:
            return []
    
    def validate_yaml(self, value):
        parsed = yaml.safe_load(value)
        if not isinstance(parsed, dict):
            raise serializers.ValidationError("YAML is malformed")
        # Ensure we don't have duplicate question names
        questions = parsed.get('questions', [])
        question_names = set() # temp to store questions we found so far
        for question in questions:
            for key in question:
                # Ensure the question as minimum required params
                for key in ['name', 'type', 'prompt', 'default']:
                    if key not in question:
                        raise serializers.ValidationError(f"Question is missing '{key}' field")
            name = question['name']
            if name in question_names:
                raise serializers.ValidationError(f"Duplicate question name found: '{name}'")
            question_names.add(name)
        
        return value

class PatternGroupSerializer(serializers.ModelSerializer):
    patterns = PatternSerializer(many=True, read_only=True)
    
    class Meta:
        model = PatternGroup
        fields = '__all__'

class PatternSummarySerializer(serializers.ModelSerializer):
    pattern_group = serializers.SerializerMethodField()
    
    class Meta:
        model = Pattern
        exclude = ('group', 'yaml', 'questions')
    
    def get_pattern_group(self, obj):
        return PatternGroupSerializer(obj.group).data

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

# BEGIN PRODUCT PROPERTIES
# We don't allow "None" types. Only device roles are optional, and that's indicated with null
class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = ['name']
    
    # We defined a field called "name"
    # Django sees that the function name starts with "validate_" and ends with "name"
    # and will automatically call it when the name is changed. In this example, the name
    # can't be set to "None" and will fail if attempted.
    def validate_name(self, value):
        if value.lower() == 'none':
            raise serializers.ValidationError("Value cannot be 'None'")
        return value

class DeviceRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceRole
        fields = ['name']

    def validate_name(self, value):
        if value.lower() == 'none':
            raise serializers.ValidationError("Value cannot be 'None'")
        return value

class ClassificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classification
        fields = ['name']

    def validate_name(self, value):
        if value.lower() == 'none':
            raise serializers.ValidationError("Value cannot be 'None'")
        return value
