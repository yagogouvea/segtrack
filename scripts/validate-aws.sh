#!/bin/bash

# Função para log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Iniciando validação da configuração AWS..."

# 1. Verificar instalação do AWS CLI
if ! command -v aws &> /dev/null; then
    log "❌ AWS CLI não está instalado"
    exit 1
else
    AWS_VERSION=$(aws --version)
    log "✅ AWS CLI instalado: $AWS_VERSION"
fi

# 2. Verificar credenciais AWS
log "Verificando credenciais AWS..."
if ! aws sts get-caller-identity &> /dev/null; then
    log "❌ Credenciais AWS não configuradas ou inválidas"
    exit 1
else
    ACCOUNT_INFO=$(aws sts get-caller-identity)
    log "✅ Credenciais AWS válidas:"
    echo "$ACCOUNT_INFO"
fi

# 3. Verificar acesso ao bucket S3
S3_BUCKET="segtrack-backups"
log "Verificando acesso ao bucket S3: $S3_BUCKET"

# Tentar listar o bucket
if ! aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
    log "❌ Não foi possível acessar o bucket $S3_BUCKET"
    
    # Verificar se o bucket existe
    if ! aws s3api head-bucket --bucket "$S3_BUCKET" 2>/dev/null; then
        log "   - Bucket não existe. Tentando criar..."
        if aws s3 mb "s3://$S3_BUCKET" --region us-east-1; then
            log "✅ Bucket criado com sucesso"
        else
            log "❌ Falha ao criar o bucket"
            exit 1
        fi
    else
        log "❌ Bucket existe mas não temos permissão de acesso"
        exit 1
    fi
else
    log "✅ Acesso ao bucket S3 confirmado"
fi

# 4. Testar operações no bucket
TEST_FILE="/tmp/aws-test-$RANDOM.txt"
echo "Test file" > "$TEST_FILE"

log "Testando operações no bucket..."

# Upload
if aws s3 cp "$TEST_FILE" "s3://$S3_BUCKET/test/test-file.txt"; then
    log "✅ Upload para S3 funcionando"
else
    log "❌ Falha no upload para S3"
    rm "$TEST_FILE"
    exit 1
fi

# Download
if aws s3 cp "s3://$S3_BUCKET/test/test-file.txt" "${TEST_FILE}-download"; then
    log "✅ Download do S3 funcionando"
else
    log "❌ Falha no download do S3"
    rm "$TEST_FILE"
    exit 1
fi

# Limpeza
aws s3 rm "s3://$S3_BUCKET/test/test-file.txt"
rm "$TEST_FILE" "${TEST_FILE}-download"

log "✅ Validação AWS concluída com sucesso!" 