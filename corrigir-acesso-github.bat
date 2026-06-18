@echo off
title Rural Commerce - Corrigir Acesso GitHub
cd /d "%~dp0"

echo Limpando credenciais antigas do GitHub no Windows...
cmdkey /delete:LegacyGeneric:target=git:https://github.com >nul 2>&1
cmdkey /delete:LegacyGeneric:target=git:https://ruralcommerce@github.com >nul 2>&1
cmdkey /delete:LegacyGeneric:target=git:https://etholys@github.com >nul 2>&1

echo.
echo Definindo remoto com usuario desejado (ruralcommerce)...
git remote set-url origin https://ruralcommerce@github.com/ruralcommerce/ruralcommerce.git

echo.
echo Tentando autenticar novamente no GitHub...
echo Se abrir prompt/login, entre com a conta que tem acesso ao repo ruralcommerce/ruralcommerce.
git fetch origin
if errorlevel 1 (
  echo.
  echo [ERRO] Ainda sem acesso ao repositorio.
  echo Verifique se a conta usada tem permissao de escrita no repo.
  echo Se necessario, aceite o convite no GitHub da organizacao/repositorio.
  pause
  exit /b 1
)

echo.
echo [OK] Autenticacao validada. Agora rode: atualizar-git-web.bat
echo.
pause
