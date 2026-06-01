@echo off
REM Database Setup Script for Service Report System (Windows)
REM This script creates the PostgreSQL database and runs migrations

setlocal enabledelayedexpansion

set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=service_report
set DB_USER=postgres
set DB_PASSWORD=postgres

echo Setting up Service Report System Database...
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo Database: %DB_NAME%

REM Create database
echo Creating database '%DB_NAME%'...
set PGPASSWORD=%DB_PASSWORD%
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" | find "1" >nul
if errorlevel 1 (
  psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -c "CREATE DATABASE %DB_NAME%"
)

echo Running migrations...

REM Run migration files
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f ./migrations/001_init.sql
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f ./migrations/002_seed_data.sql
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f ./migrations/003_devices_seed.sql
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f ./migrations/004_service_report_cms.sql

echo Database setup completed successfully!
pause
