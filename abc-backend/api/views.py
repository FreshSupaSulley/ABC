from django.core.mail import EmailMessage
from django.contrib.auth.models import User
from django.db.models import Max
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny, SAFE_METHODS
from rest_framework.exceptions import NotFound
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import *
from .serializers import *
from .permissions import ReadOnlyOrAdmin

from .utils import *
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

# Generate BOM
@api_view(["POST"])
@permission_classes([AllowAny])
def download_bom(request, id):
    pattern = get_object_or_404(Pattern, id=id)
    answers = request.data.get("answers", {})
    
    # EMAIL
    email = request.data.get("email", None)
    
    if not isinstance(answers, dict):
        return Response({"error": "Missing or invalid answers"}, status=400)
    try:
        pdf_bytes = generate_bom_from_yaml(pattern.group.name, pattern.yaml, answers, True) # True indicates we're building a PDF, so we should throw an error if it's empty
        
        # If email is present
        if email:
            email_subject = "Your BOM PDF"
            email_body = f"Attached is the BOM you requested."
            email_message = EmailMessage(email_subject, email_body, to=[email])
            email_message.attach(f"{pattern.group.name}-bom.pdf", pdf_bytes, "application/pdf")
            email_message.send()
            return Response({"message": "Email sent successfully."}, status=200)
        
        response = HttpResponse(
            pdf_bytes,
            content_type=f"attachment; filename=\"{pattern.group.name}-bom.pdf\"",
        )
        return response
    except Exception as e:
        print(f"Failed during download BOM: {e}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "POST", "PATCH"])
@permission_classes([AllowAny])
def pattern_list_create(request):
    if request.method == "GET":
        patterns = Pattern.objects.all()
        serializer = PatternSummarySerializer(patterns, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == "POST":
        # If editing data, ALWAYS check if it's a superuser
        if not request.user.is_superuser:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        
        # Extract the data from the request
        name = request.data.get('name')
        description = request.data.get('description')
        
        # Check if the PatternGroup already exists
        pattern_group, created = PatternGroup.objects.get_or_create(
            name=name,
            defaults={'description': description}  # This will be used only if creating a new entry
        )
        
        # If the group is newly created, we should validate the serializer
        if created:
            # Validate and save using the serializer
            serializer = PatternGroupSerializer(pattern_group, data=request.data)
            if serializer.is_valid():
                serializer.save()  # Save only if the serializer is valid
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # If it was not created (it already exists), you have the existing pattern_group to use
        # Find the maximum version number for the PatternGroup
        max_version = Pattern.objects.filter(group=pattern_group).aggregate(Max('version'))['version__max']
        new_version = (max_version or 0) + 1  # Increment max version or start with 1
        
        # Create a new Pattern with the auto-incremented version
        pattern = Pattern.objects.create(
            group=pattern_group,
            description=description if not created else "", # use the provided description ONLY IF the group wasn't created. No need to set the version description too
            version=new_version  # Use the new version
        )
        return Response(PatternSerializer(pattern).data, status=status.HTTP_201_CREATED)
    
    elif request.method == "PATCH":
        if not request.user.is_superuser:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        # Ensure pattern group name is provided in the request data
        group_name = request.data.get('name')
        description = request.data.get('description')
        
        if not group_name or description is None:
            return Response({"error": "Group ID and new description must be provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            pattern_group = PatternGroup.objects.get(name=group_name)
            pattern_group.description = description
            pattern_group.save()
            return Response(PatternGroupSerializer(pattern_group).data, status=status.HTTP_200_OK)
        except PatternGroup.DoesNotExist:
            return Response({"error": "Pattern group not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(["GET", "PATCH"])
@permission_classes([AllowAny])
def get_edit_pattern(request, id):
    try: 
        pattern = Pattern.objects.get(id=id)
        if request.method == "GET":
            serializer = PatternSerializer(pattern)
            return Response(serializer.data, status=status.HTTP_200_OK)
        # Editing
        elif request.method == "PATCH":
            if not request.user.is_superuser:
                return Response(status=status.HTTP_401_UNAUTHORIZED)
            # VALIDATE YAML!!
            try:
                serializer = PatternSerializer(pattern, data=request.data, partial=True)
                if not serializer.is_valid():
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                # Update everything else
                for attr, value in serializer.validated_data.items():
                    setattr(pattern, attr, value)
                # Begin validation
                yaml_updated = request.data.get('yaml', None)
                if yaml_updated:
                    pattern.yaml = yaml_updated
                    # Trying to save triggers clean method validation
                    try:
                        pattern.save()
                        return Response(serializer.data, status=status.HTTP_200_OK)
                    except Exception as e:
                        return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"error": "No YAML content provided"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Pattern.DoesNotExist:
        raise NotFound("Pattern not found")

# Protected by default since no @permission_classes([AllowAny])
@api_view(["DELETE"])
def pattern_group_delete(request, pk):
    try:
        group = PatternGroup.objects.get(pk=pk)
        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Pattern.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

# Product Views
@api_view(["GET", "POST"])
# Only allow logged in users (admins) to get / modify product data
@permission_classes([IsAdminUser])
def product_list_create(request):
    if request.method == "GET":
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def single_product(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "PATCH":
        if not request.user.is_superuser:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        if not request.user.is_superuser:
            return Response("You are not authorized to perform this action hb.", status=status.HTTP_403_FORBIDDEN)
        serializer = ProductSerializer(product)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Get all classifications of a product
@api_view(["GET"])
@permission_classes([AllowAny])
def get_classification(request):
    classifications = Product.Classification.choices
    classification_list = [
        {"value": classification[0], "label": classification[1]} for classification in classifications
    ]
    return Response(classification_list)


# Product fields
# View for Manufacturer
class ManufacturerListCreateAPIView(generics.ListCreateAPIView):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer

class ManufacturerRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer

# View for DeviceRole
class DeviceRoleListCreateAPIView(generics.ListCreateAPIView):
    queryset = DeviceRole.objects.all()
    serializer_class = DeviceRoleSerializer

class DeviceRoleRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DeviceRole.objects.all()
    serializer_class = DeviceRoleSerializer

# View for Classification
class ClassificationListCreateAPIView(generics.ListCreateAPIView):
    queryset = Classification.objects.all()
    serializer_class = ClassificationSerializer

class ClassificationRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Classification.objects.all()
    serializer_class = ClassificationSerializer
