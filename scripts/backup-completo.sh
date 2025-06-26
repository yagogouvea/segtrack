#!/bin/bash

# Configurações
BACKUP_DIR="/var/backups/completo"
MYSQL_USER="segtrack_admin"
MYSQL_PASSWORD="3500@17V440g"
MYSQL_DATABASE="segtrack"
S3_BUCKET="segtrack-backups"
BACKUP_RETENTION_DAYS=30

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Nome do arquivo de backup
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/segtrack_backup_$DATE.sql"
COMPRESSED_FILE="$BACKUP_FILE.gz"

# Log function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$BACKUP_DIR/backup.log"
}

log "Iniciando backup do banco de dados..."

# Realizar backup MySQL
mysqldump --user=$MYSQL_USER --password=$MYSQL_PASSWORD $MYSQL_DATABASE > $BACKUP_FILE
if [ $? -eq 0 ]; then
    log "Backup MySQL realizado com sucesso"
else
    log "ERRO: Falha ao realizar backup MySQL"
    exit 1
fi

# Comprimir backup
gzip $BACKUP_FILE
if [ $? -eq 0 ]; then
    log "Backup comprimido com sucesso"
else
    log "ERRO: Falha ao comprimir backup"
    exit 1
fi

# Upload para S3
aws s3 cp $COMPRESSED_FILE s3://$S3_BUCKET/mysql_backups/$(basename $COMPRESSED_FILE)
if [ $? -eq 0 ]; then
    log "Backup enviado para S3 com sucesso"
else
    log "ERRO: Falha ao enviar backup para S3"
    # Não sair com erro aqui, pois o backup local ainda é válido
fi

# Limpar backups antigos (locais)
find $BACKUP_DIR -name "segtrack_backup_*.sql.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -delete
if [ $? -eq 0 ]; then
    log "Limpeza de backups antigos realizada com sucesso"
else
    log "AVISO: Falha ao limpar backups antigos"
fi

# Verificar espaço em disco
DISK_USAGE=$(df -h $BACKUP_DIR | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    log "AVISO: Uso de disco está acima de 85% ($DISK_USAGE%)"
fi

log "Processo de backup finalizado" 