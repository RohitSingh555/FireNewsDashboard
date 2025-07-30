@echo off
setlocal enabledelayedexpansion

echo 🔥 FireNewsDashboard Deployment Script
echo ======================================

if "%1"=="" goto usage

if "%1"=="local" goto start_local
if "%1"=="prod" goto start_prod
if "%1"=="stop-local" goto stop_local
if "%1"=="stop-prod" goto stop_prod
if "%1"=="logs-local" goto logs_local
if "%1"=="logs-prod" goto logs_prod
if "%1"=="status" goto status
goto usage

:usage
echo Usage: %0 [local^|prod^|stop-local^|stop-prod^|logs-local^|logs-prod^|status]
echo.
echo Commands:
echo   local       - Start local development environment (ports 8000, 3000)
echo   prod        - Start production environment (ports 9500, 3500)
echo   stop-local  - Stop local environment
echo   stop-prod   - Stop production environment
echo   logs-local  - Show local environment logs
echo   logs-prod   - Show production environment logs
echo   status      - Show status of all containers
echo.
goto end

:start_local
echo 🚀 Starting local development environment...
docker-compose down
docker-compose up --build -d
echo ✅ Local environment started!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:8000
echo 🗄️  Database: localhost:33306
goto end

:start_prod
echo 🚀 Starting production environment...
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
echo ✅ Production environment started!
echo 📱 Frontend: http://localhost:3500
echo 🔧 Backend:  http://localhost:9500
echo 🗄️  Database: localhost:33306
goto end

:stop_local
echo 🛑 Stopping local environment...
docker-compose down
echo ✅ Local environment stopped!
goto end

:stop_prod
echo 🛑 Stopping production environment...
docker-compose -f docker-compose.prod.yml down
echo ✅ Production environment stopped!
goto end

:logs_local
echo 📋 Local environment logs:
docker-compose logs -f
goto end

:logs_prod
echo 📋 Production environment logs:
docker-compose -f docker-compose.prod.yml logs -f
goto end

:status
echo 📊 Container Status:
echo.
echo Local Environment:
docker-compose ps
echo.
echo Production Environment:
docker-compose -f docker-compose.prod.yml ps
goto end

:end 