@echo off
:: This bat file will run application in dev local mode


:: Seting variable of script directory
set SCRIPT_DIR=%~dp0

:: Changing directory to docker compsoe location
cd /d "%SCRIPT_DIR%..\deployment\dev\local"

:: Running docker compose
docker-compose up --build -d