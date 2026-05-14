@echo off
cd /d "%~dp0\.."
call npm run deploy:servidor
if errorlevel 1 (
  echo.
  echo [ERRO] Veja as mensagens acima. Ajuste o .env.local se faltar configuracao.
) else (
  echo.
  echo Tudo certo. Pode fechar esta janela.
)
echo.
pause
