@echo off
title Rural Commerce — Atualizar Git Web
cd /d "%~dp0"

echo Enviando alteracoes para o GitHub (commit/pull --rebase/push)...
call npm run sync:saida
if errorlevel 1 (
  echo.
  echo [ERRO] Falha ao atualizar no Git web. Veja as mensagens acima.
  pause
  exit /b 1
)

echo.
echo [OK] Codigo enviado para o Git web.
echo.
pause
