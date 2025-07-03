#!/bin/bash

# Run backend
cd backend
poetry run python manage.py runserver 3001 &
BACKEND_PID=$!

# Run frontend
cd ../frontend
npm start &
FRONTEND_PID=$!

# Kill both on Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
