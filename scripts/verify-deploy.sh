#!/bin/bash

# Função para log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Iniciando verificação do deployment..."

# 1. Verificar diretório de backup
if [ -d "/var/backups/completo" ]; then
    log "✅ Diretório de backup existe"
    ls -la /var/backups/completo
else
    log "❌ Diretório de backup não encontrado"
    exit 1
fi

# 2. Verificar permissões
BACKUP_PERMS=$(stat -c "%a" /var/backups/completo)
if [ "$BACKUP_PERMS" = "700" ]; then
    log "✅ Permissões do diretório corretas"
else
    log "❌ Permissões incorretas: $BACKUP_PERMS (deveria ser 700)"
fi

# 3. Verificar crontab
if crontab -l | grep -q "backup-completo.sh"; then
    log "✅ Crontab configurado"
    crontab -l | grep "backup-completo.sh"
else
    log "❌ Crontab não configurado"
fi

# 4. Verificar MySQL
if mysql --user=$MYSQL_USER --password=$MYSQL_PASSWORD -e "SELECT 1" &>/dev/null; then
    log "✅ Conexão MySQL funcionando"
else
    log "❌ Falha na conexão MySQL"
fi

# 5. Verificar AWS CLI
if aws --version &>/dev/null; then
    log "✅ AWS CLI instalado"
    aws --version
else
    log "❌ AWS CLI não encontrado"
fi

# 6. Verificar acesso ao S3
if aws s3 ls "s3://$S3_BUCKET" &>/dev/null; then
    log "✅ Acesso ao bucket S3 confirmado"
    aws s3 ls "s3://$S3_BUCKET" | tail -n 5
else
    log "❌ Falha no acesso ao bucket S3"
fi

# 7. Verificar logs
if [ -f "/var/backups/completo/backup.log" ]; then
    log "✅ Arquivo de log existe"
    tail -n 5 /var/backups/completo/backup.log
else
    log "❌ Arquivo de log não encontrado"
fi

# 8. Verificar espaço em disco
DISK_USAGE=$(df -h /var/backups/completo | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 85 ]; then
    log "✅ Espaço em disco adequado: $DISK_USAGE%"
else
    log "⚠️ Atenção: Uso de disco alto: $DISK_USAGE%"
fi

log "Verificação concluída!" 