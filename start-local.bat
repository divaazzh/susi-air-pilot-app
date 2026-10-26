@echo off
title Susi Air Pilot App - Local Launcher
echo =======================================================
echo          SUSI AIR PILOT OPERATIONS APP
echo =======================================================
echo.
echo Starting NestJS Backend API (Port 3000)...
start "Susi Air Backend (NestJS :3000)" cmd /k "cd /d "%~dp0nest" && npm run start:dev"

echo Waiting 4 seconds for NestJS to initialize...
timeout /t 4 /nobreak >nul

echo Starting Nuxt 3 Frontend (Port 3001)...
start "Susi Air Frontend (Nuxt 3 :3001)" cmd /k "cd /d "%~dp0nuxt" && npm run dev"

echo.
echo =======================================================
echo Local app is launching!
echo Backend API  : http://localhost:3000
echo Frontend Web : http://localhost:3001 (or 3000)
echo Credentials  : johndoe / susiairtest
echo =======================================================
pause
