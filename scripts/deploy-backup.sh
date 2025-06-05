#!/bin/bash

# Função para log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-completo.sh"
VALIDATE_AWS_SCRIPT="$SCRIPT_DIR/validate-aws.sh"

log "Iniciando deployment da rotina de backup..."

# 1. Verificar se scripts existem
if [ ! -f "$BACKUP_SCRIPT" ] || [ ! -f "$VALIDATE_AWS_SCRIPT" ]; then
    log "❌ Scripts necessários não encontrados"
    exit 1
fi

# 2. Tornar scripts executáveis
chmod +x "$BACKUP_SCRIPT" "$VALIDATE_AWS_SCRIPT"

# 3. Validar configuração AWS
log "Validando configuração AWS..."
if ! "$VALIDATE_AWS_SCRIPT"; then
    log "❌ Falha na validação AWS"
    exit 1
fi

# 4. Criar diretório de backup
BACKUP_DIR="/var/backups/completo"
if ! mkdir -p "$BACKUP_DIR"; then
    log "❌ Falha ao criar diretório de backup"
    exit 1
fi

# 5. Configurar permissões
chown -R root:root "$BACKUP_DIR"
chmod -R 700 "$BACKUP_DIR"

# 6. Instalar dependências
log "Verificando dependências..."

# MySQL client
if ! command -v mysql &> /dev/null; then
    log "Instalando MySQL client..."
    apt-get update && apt-get install -y mysql-client
fi

# 7. Testar conexão MySQL
if ! mysql --user=segtrack_admin --password=3500@17V440g -e "SELECT 1" &> /dev/null; then
    log "❌ Falha ao conectar ao MySQL"
    exit 1
fi

# 8. Configurar crontab
log "Configurando crontab..."
CRON_CMD="0 3 * * * $BACKUP_SCRIPT"
(crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT"; echo "$CRON_CMD") | crontab -

# 9. Executar backup inicial
log "Executando backup inicial de teste..."
if ! "$BACKUP_SCRIPT"; then
    log "❌ Falha no backup inicial"
    exit 1
fi

log "✅ Deployment da rotina de backup concluído com sucesso!"
log "📋 Próximos backups agendados para 3:00 AM diariamente"
log "📁 Local dos backups:"
log "   - Local: $BACKUP_DIR"
log "   - S3: s3://segtrack-backups/mysql_backups/" 