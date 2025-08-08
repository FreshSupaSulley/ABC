# Backend
Django backend with an API to communicate to the frontend with JWTs.

## Quickstart
`poetry run python manage.py runserver`

Note you need to use the `poetry run` prefix (or enter a shell with `poetry shell`).

## Make DB changes
`poetry run python3 manage.py makemigrations`
`poetry run python3 manage.py migrate`
... weirdly the only thing that worked consistently was delete the db file, then run `poetry run python manage.py migrate --run-syncdb`. Scary.

## Mystery `No Such Table` error
`poetry run python manage.py migrate --run-syncdb`

## Clear the DB
`poetry run python manage.py flush`

## Create admin
`poetry run python manage.py createsuperuser`
> You can also run the `create_superuserpy` script to create a default user.

# Where the hell is the DB
Stored in the root as `db.sqlite3`.

# File structure

## /backend
Contains all the basic Django boilerplate setup things, namely `settings.py` and `urls.py`.

## /api
The meat of ABC.

### models.py
Defines all of the tables that get defined in the DB.

### urls.py
Defines the API endpoints. Endpoints use `views.py` to respond.

### views.py
Handles responding to API calls.

`@api_view` allows you set the allowed HTTP request types, like GET, POST, PATCH, etc.
`@permission_classes` defines which groups are allowed to access that particular endpoint.

**NOTE:** Do NOT let the world be able to edit DB data. Take careful care to protect the right endpoints by checking if they're a superuser / logged in before handling the request.

### serializers.py
Defines which fields in the tables get returned to the frontend through API endpoints.

### utils.py
Defines the helper functions that generate the BOM that gets returned to PLs.

This uses 2 libraries to generate the BOM: `reportlab`, and `openpyxl`. Openpyxl is used to first create an excel sheet internally. Then, that sheet is passed to `excel_to_pdf` to convert that excel sheet to a PDF.

# Dockerfile
Used to build the ABC backend image for deployment. It runs `start.sh` to setup the DB and spin up the service.
