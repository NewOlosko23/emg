@echo off
echo ========================================
echo EMG Mobile APK Builder
echo ========================================

echo Checking environment...

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install JDK 17 or 21 and set JAVA_HOME
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Environment check passed!
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building APK...
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Failed to build APK
    echo Please check your Android SDK setup
    pause
    exit /b 1
)

echo.
echo ========================================
echo APK Build Successful!
echo ========================================
echo.
echo Your APK is located at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo You can now install this APK on your Android device.
echo.
pause
