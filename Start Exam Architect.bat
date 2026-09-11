@echo off
echo =========================================
echo Starting GNPS Exam Architect Server...
echo Close this command prompt window to stop the app.
echo =========================================

:: Open the browser
start "" http://localhost:8000

:: Try to start the Python server using common Windows Python commands
python server.py
if %errorlevel% neq 0 (
    echo.
    echo Trying alternative command...
    py server.py
    if %errorlevel% neq 0 (
        echo.
        echo Trying alternative command...
        python3 server.py
        if %errorlevel% neq 0 (
            echo.
            echo =========================================
            echo [ERROR] Python is not installed or not found!
            echo =========================================
            echo To run this app on Windows, you need Python installed.
            echo 1. Go to https://www.python.org/downloads/
            echo 2. Download the latest installer for Windows.
            echo 3. IMPORTANT: When you run the installer, check the box
            echo    at the bottom that says "Add Python to PATH".
            echo 4. After installation, try running this .bat file again.
            echo =========================================
            echo.
            pause
        )
    )
)
