@echo off
REM stop.bat - Stop the application on Windows

echo Stopping ToDo Application...

REM Find PID of process listening on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo Killing process %%a found on port 3001...
    taskkill /F /PID %%a
    echo Application stopped.
    goto :end
)

echo No running application found on port 3001.

:end
