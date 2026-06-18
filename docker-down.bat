@echo off
cd /d "%~dp0"
echo Parando Docker LOCAL... (nao faz GitHub/deploy)
docker compose down
pause
