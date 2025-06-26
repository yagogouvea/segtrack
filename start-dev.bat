@echo off
echo Iniciando backend Segtrack em modo desenvolvimento...
echo.
echo Configurando variaveis de ambiente...
set NODE_ENV=development
set PORT=3000
set HOST=0.0.0.0
set JWT_SECRET=segtrack-dev-secret-key-2024
set UPLOAD_DIR=./uploads
set MAX_FILE_SIZE=10485760
set LOG_LEVEL=debug
echo.
echo Instalando dependencias se necessario...
npm install
echo.
echo Iniciando servidor...
npm run dev:simple
pause 