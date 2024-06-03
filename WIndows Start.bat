@echo off
REM
where nodemon >nul 2>nul
if %errorlevel% equ 0 (
    echo nodemon is installed. Starting the server...
    nodemon start
) else (
    echo nodemon is not installed. Installing...
    npm install nodemon
    nodemon start
)
