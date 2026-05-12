@echo off
title Rural Commerce — Docker (porta 3001)
cd /d "%~dp0"

echo Subindo Rural Commerce em Docker...
echo Depois abra: http://localhost:3001
echo.

docker compose up -d

if errorlevel 1 (
  echo.
  echo Falhou. Veja a mensagem acima.
  pause
  exit /b 1
)

echo.
echo OK. Para ver logs: docker compose logs -f web
echo Para parar: docker compose down
echo.
pause
