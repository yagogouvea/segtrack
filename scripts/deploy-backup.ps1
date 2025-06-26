# PowerShell script para preparar o ambiente de backup

# Funcao para log
function Write-Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

Write-Log "Preparando ambiente para deploy da rotina de backup..."

# Verificar se os scripts existem
$scriptsPath = ".\backend\scripts"
$requiredFiles = @(
    "validate-aws.sh",
    "backup-completo.sh",
    "deploy-backup.sh"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path "$scriptsPath\$file")) {
        Write-Log "Arquivo nao encontrado: $file"
        exit 1
    }
}

Write-Log "Todos os scripts encontrados"

# Criar arquivo de variaveis de ambiente
$envContent = @'
export AWS_ACCESS_KEY_ID=AKIA4VEXEMPLOXXXP
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXEMPLOKEY
export AWS_REGION=us-east-1
export S3_BUCKET=segtrack-backups
export MYSQL_USER=segtrack_admin
export MYSQL_PASSWORD="3500@17V440g"
export MYSQL_DATABASE=segtrack
export DB_HOST=127.0.0.1
'@

$envFile = ".\backend\scripts\backup.env"
$envContent | Out-File -FilePath $envFile -Encoding utf8
Write-Log "Arquivo de variaveis de ambiente criado: backup.env"

# Criar script de execucao para o EC2
$deployScript = @'
#!/bin/bash

# Carregar variaveis de ambiente
source ./backup.env

# Tornar scripts executaveis
chmod +x validate-aws.sh backup-completo.sh deploy-backup.sh

# Executar deploy
./deploy-backup.sh
'@

$execFile = ".\backend\scripts\execute-deploy.sh"
$deployScript | Out-File -FilePath $execFile -Encoding utf8
Write-Log "Script de execucao criado: execute-deploy.sh"

Write-Log "Ambiente preparado com sucesso!"
Write-Log ""
Write-Log "Instrucoes para deploy no EC2:"
Write-Log "1. Copie todos os arquivos da pasta 'backend/scripts' para o servidor EC2"
Write-Log "2. No EC2, navegue ate a pasta dos scripts"
Write-Log "3. Execute: chmod +x execute-deploy.sh"
Write-Log "4. Execute: sudo ./execute-deploy.sh"
Write-Log ""
Write-Log "Importante: Certifique-se de que o MySQL esta instalado e acessivel no EC2" 