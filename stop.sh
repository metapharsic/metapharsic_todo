#!/bin/bash

# stop.sh - Stop the application on Linux/macOS

echo "Stopping ToDo Application..."

if [ -f server.pid ]; then
    PID=$(cat server.pid)
    echo "Killing process $PID from server.pid..."
    kill $PID && rm server.pid
    echo "Application stopped."
else
    # Fallback: check port 3001
    PID=$(lsof -t -i:3001)
    if [ -n "$PID" ]; then
        echo "Killing process $PID found on port 3001..."
        kill $PID
        echo "Application stopped."
    else
        echo "No running application found (no server.pid or process on port 3001)."
    fi
fi
