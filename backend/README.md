# Backend
Django backend with an API to communicate to the frontend with JWT security.

## Quickstart
`poetry run python manage.py runserver 3001` (3001 because 3000 is often used by something)

When finished, use CTRL+D to exit the virtual environment (or maybe you don't have to??).

## Make DB changes
`poetry run python3 manage.py makemigrations`
`poetry run python3 manage.py migrate`

## Create admin
`python manage.py createsuperuser`

### Dev admin
Username: `balls`
Password: `balls`

# DB
Stored as `db.sqlite3` for dev.

## DB user
Username: `unga`
Password: `bunga`
