#!/bin/bash
# Initialize the submoduled repos
git submodule update --init

# Setup backend with debug enabled
cd abc-backend
poetry install # Install everything
# Ripped from start.sh (except for gunicorn)
poetry run python manage.py makemigrations
poetry run python manage.py migrate --run-syncdb
poetry run python create_superuser.py
poetry run python manage.py collectstatic --noinput

# Setup frontend
cd ../abc-frontend
npm i
