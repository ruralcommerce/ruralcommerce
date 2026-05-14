@echo off
cd /d "%~dp0\.."
call npm run sync:entrada
if errorlevel 1 (
  echo.
  echo [ERRO] O script terminou com falha. Veja as mensagens acima.
) else (
  echo.
  echo Tudo certo. Pode fechar esta janela.
)
echo.
pause
