@echo off
REM start.bat - Start the application on Windows

echo Starting ToDo Application...

REM Ensure logs directory exists
if not exist "logs" mkdir logs

REM Ensure dependencies are installed in backend
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    pushd backend
    call npm install
    popd
)

REM (Optional) Build frontend if dist doesn't exist
if not exist "metapharsic-frontend\dist" (
    echo Frontend build not found. Building frontend...
    pushd metapharsic-frontend
    call npm install
    call npm run build
    popd
)

REM Start backend in a new background process
echo Starting backend server...
REM Using 'start' without /B to ensure it survives the batch script's shell closing, 
REM but using 'cmd /c' to handle redirections correctly.
start "" /min cmd /c "node backend\server.js > logs\server.log 2>&1"

echo Application started!
echo General logs: logs\server.log
echo Error logs: logs\app_error.log ^& logs\db_error.log
echo Access the app at http://localhost:3001
