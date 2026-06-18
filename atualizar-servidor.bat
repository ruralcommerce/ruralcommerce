@echo off
title Rural Commerce — Atualizar Servidor
cd /d "%~dp0"

echo Executando deploy no servidor via SSH...
call npm run deploy:servidor
if errorlevel 1 (
  echo.
  echo [ERRO] Falha no deploy do servidor. Veja as mensagens acima.
  echo Verifique as variaveis HETZNER_* no .env.local.
  pause
  exit /b 1
)

echo.
echo [OK] Deploy no servidor concluido.
echo.
pause
