# Use an official Python base image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_VERSION=1.8.2

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    libpq-dev \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 - && \
    ln -s /root/.local/bin/poetry /usr/local/bin/poetry

# Copy only the necessary files for dependency installation
COPY pyproject.toml poetry.lock* /app/

# Configure Poetry to use the custom PyPI source
RUN poetry config repositories.nexus_ci https://nexus-ci.onefiserv.net/repository/pypi-group/simple && \
    poetry config installer.parallel false

# Install dependencies
RUN poetry install --no-root --only main

# Copy the rest of the application code
COPY . /app

# Expose the port Django runs on
EXPOSE 8000

# Run the Django app
CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
