Write-Host "Iniciando backend Segtrack em modo desenvolvimento..." -ForegroundColor Green
Write-Host ""

Write-Host "Configurando variaveis de ambiente..." -ForegroundColor Yellow
$env:NODE_ENV = "development"
$env:PORT = "3000"
$env:HOST = "0.0.0.0"
$env:JWT_SECRET = "segtrack-dev-secret-key-2024"
$env:UPLOAD_DIR = "./uploads"
$env:MAX_FILE_SIZE = "10485760"
$env:LOG_LEVEL = "debug"

Write-Host ""
Write-Host "Instalando dependencias se necessario..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Iniciando servidor..." -ForegroundColor Green
npm run dev:simple

Read-Host "Pressione Enter para sair" 