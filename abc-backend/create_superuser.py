import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.getenv("DJANGO_SUPERUSER_USERNAME") or "admin"
email = os.getenv("DJANGO_SUPERUSER_EMAIL") or "test@example.com"
password = os.getenv("DJANGO_SUPERUSER_PASSWORD") or "admin"

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Created superuser {username}")
else:
    print(f"Superuser {username} already exists")
