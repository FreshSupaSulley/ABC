#!/bin/bash

# Run backend with debug enabled
export DEBUG="True"
export REACT_APP_FRONTEND_PORT="${1:-3000}"
export REACT_APP_BACKEND_PORT="${2:-8000}"

echo "Using port $REACT_APP_BACKEND_PORT for the backend"
echo "Using port $REACT_APP_FRONTEND_PORT for the frontend"

cd abc-backend
poetry run python manage.py runserver 0.0.0.0:$REACT_APP_BACKEND_PORT &
BACKEND_PID=$!

# Run frontend
cd ../abc-frontend
PORT=$REACT_APP_FRONTEND_PORT npm start &
FRONTEND_PID=$!

# Kill both on Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
