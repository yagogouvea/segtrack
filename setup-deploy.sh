#!/bin/bash

# Função para validar variáveis de ambiente
check_env() {
  local var_name=$1
  local var_value=$2
  if [ -z "$var_value" ]; then
    echo "❌ ERROR: $var_name não está definida!"
    exit 1
  else
    echo "✅ $var_name está configurada"
  fi
}

echo "🔍 Verificando variáveis de ambiente..."

# Database URL
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️ DATABASE_URL não definida, usando valor padrão..."
  export DATABASE_URL="mysql://segtrack_admin:3500@17V440g@35.192.214.51:3306/segtrack"
fi
check_env "DATABASE_URL" "$DATABASE_URL"

# JWT Secret
if [ -z "$JWT_SECRET" ]; then
  echo "⚠️ JWT_SECRET não definido, usando valor padrão..."
  export JWT_SECRET="segtrack-ultra-seguro-123"
fi
check_env "JWT_SECRET" "$JWT_SECRET"

# Cloud SQL Connection
if [ -z "$CLOUD_SQL_CONNECTION_NAME" ]; then
  echo "⚠️ CLOUD_SQL_CONNECTION_NAME não definido, usando valor padrão..."
  export CLOUD_SQL_CONNECTION_NAME="cobalt-anchor-458919-j4:southamerica-east1:segtrack123"
fi
check_env "CLOUD_SQL_CONNECTION_NAME" "$CLOUD_SQL_CONNECTION_NAME"

# Service Account
if [ -z "$SERVICE_ACCOUNT" ]; then
  echo "⚠️ SERVICE_ACCOUNT não definida, usando valor padrão..."
  export SERVICE_ACCOUNT="segtrack123@cobalt-anchor-458919-j4.iam.gserviceaccount.com"
fi
check_env "SERVICE_ACCOUNT" "$SERVICE_ACCOUNT"

# VPC Connector
if [ -z "$VPC_CONNECTOR" ]; then
  echo "⚠️ VPC_CONNECTOR não definido, usando valor padrão..."
  export VPC_CONNECTOR="projects/cobalt-anchor-458919-j4/locations/southamerica-east1/connectors/segtrack-vpc"
fi
check_env "VPC_CONNECTOR" "$VPC_CONNECTOR"

echo "✅ Todas as variáveis de ambiente estão configuradas"
echo "🚀 Iniciando deploy..."

# Executa o deploy
./deploy.sh 