# Use an official Python slim base image
FROM python:3.12-slim

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=1.8.2 \
    POETRY_NO_INTERACTION=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpq-dev \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    ln -s /root/.local/bin/poetry /usr/local/bin/poetry

# Copy Poetry config and install dependencies
COPY pyproject.toml poetry.lock* /app/
RUN poetry config installer.parallel false
RUN poetry install --no-root --only main

# Copy the rest of the application code
COPY . /app

# Expose Django port
EXPOSE 8000

# We need to create a superuser to do anything
COPY ./create_superuser.py /app/create_superuser.py

# Start the Django development server
# CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
CMD poetry run python manage.py migrate && \
    poetry run python /app/create_superuser.py && \
    poetry run python manage.py runserver 0.0.0.0:8000
