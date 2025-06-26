# Script para iniciar o servidor backend em modo desenvolvimento
$env:NODE_ENV = "development"
$env:JWT_SECRET = "segtrack-dev-secret-key-2024"

Write-Host "Iniciando servidor backend em modo desenvolvimento..."
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "JWT_SECRET: $env:JWT_SECRET"

npm run dev 