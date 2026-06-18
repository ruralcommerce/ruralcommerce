@echo off
title Rural Commerce — Publicar Tudo
cd /d "%~dp0"

echo [1/2] Enviando para Git web...
call npm run sync:saida
if errorlevel 1 (
  echo.
  echo [ERRO] Falha no passo Git. Processo interrompido.
  pause
  exit /b 1
)

echo.
echo [2/2] Atualizando servidor...
call npm run deploy:servidor
if errorlevel 1 (
  echo.
  echo [ERRO] Falha no deploy do servidor.
  echo O Git ja foi atualizado; verifique SSH/.env.local e tente novamente.
  pause
  exit /b 1
)

echo.
echo [OK] Publicacao completa: Git web + servidor.
echo.
pause
