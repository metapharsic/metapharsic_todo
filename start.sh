#!/bin/bash

# start.sh - Start the application on Linux/macOS

echo "Starting ToDo Application..."

# Ensure logs directory exists
mkdir -p logs

# Ensure dependencies are installed in backend
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# (Optional) Build frontend if dist doesn't exist
if [ ! -d "metapharsic-frontend/dist" ]; then
    echo "Frontend build not found. Building frontend..."
    cd metapharsic-frontend && npm install && npm run build && cd ..
fi

# Start backend in the background
echo "Starting backend server..."
nohup node backend/server.js > logs/server.log 2>&1 &
echo $! > server.pid

echo "Application started!"
echo "Backend PID: $(cat server.pid)"
echo "General logs: logs/server.log"
echo "Error logs: logs/app_error.log & logs/db_error.log"
echo "Access the app at http://localhost:3001"
