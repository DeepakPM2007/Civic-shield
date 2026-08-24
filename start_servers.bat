@echo off
color 0B
echo ==================================================
echo    CivicShield - Starting Application Servers
echo ==================================================
echo.

echo [*] Starting FastAPI Backend on Port 8000...
start cmd /k "cd backend && uvicorn main:app --reload"

echo [*] Starting Next.js Frontend on Port 3000...
start cmd /k "cd frontend && npm run dev"

echo.
echo [!] Both servers are starting up in new windows.
echo [!] The frontend will be available at http://localhost:3000
echo.
pause
