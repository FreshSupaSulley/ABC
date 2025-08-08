#!/bin/sh

set -e

python manage.py makemigrations
python manage.py migrate --run-syncdb
python create_superuser.py
python manage.py collectstatic --noinput
gunicorn --bind 0.0.0.0:8000 backend.wsgi:application
