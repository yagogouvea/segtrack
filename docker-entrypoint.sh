#!/bin/sh
set -e  # Encerra o script se qualquer comando falhar

echo "🚀 Iniciando container..."
echo "📝 NODE_ENV: $NODE_ENV"
echo "📡 PORT: $PORT"
echo "📂 PWD: $(pwd)"
echo "📦 Node Version: $(node -v)"
echo "📦 NPM Version: $(npm -v)"

# Verifica variáveis de ambiente críticas
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERRO CRÍTICO: DATABASE_URL não está definida!"
  exit 1
fi

if [ -z "$PORT" ]; then
  echo "⚠️ AVISO: PORT não definida, usando 8080"
  export PORT=8080
fi

if [ -z "$NODE_ENV" ]; then
  echo "⚠️ AVISO: NODE_ENV não definido, usando 'production'"
  export NODE_ENV=production
fi

# Verifica se o diretório dist existe
if [ ! -d "dist" ]; then
  echo "❌ ERRO: Diretório 'dist' não encontrado!"
  ls -la
  
  if [ -d "src" ]; then
    echo "🔄 Tentando compilar TypeScript..."
    npm run build
  else
    echo "❌ ERRO CRÍTICO: Diretório 'src' não encontrado!"
    exit 1
  fi
fi

# Verifica se o arquivo principal existe
if [ ! -f "dist/index.js" ]; then
  echo "❌ ERRO CRÍTICO: dist/index.js não encontrado!"
  ls -la dist/
  exit 1
fi

# Verifica se o Prisma Client está instalado
if [ ! -d "node_modules/.prisma" ]; then
  echo "🔄 Prisma Client não encontrado, gerando..."
  npx prisma generate
fi

# Aguarda o banco estar pronto (com timeout)
echo "⏳ Aguardando banco de dados..."
DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:]+):.*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')

echo "📡 Tentando conectar em $DB_HOST:$DB_PORT..."

timeout=30
counter=0
while ! nc -z $DB_HOST $DB_PORT 2>/dev/null
do
  if [ $counter -eq $timeout ]; then
    echo "❌ Timeout aguardando banco de dados após $timeout segundos"
    exit 1
  fi
  echo "⏳ Tentativa $counter/$timeout..."
  sleep 1
  counter=$((counter+1))
done

echo "✅ Banco de dados disponível"

# Verifica se os diretórios necessários existem
for dir in uploads relatorios-pdf; do
  if [ ! -d "$dir" ]; then
    echo "📁 Criando diretório $dir..."
    mkdir -p "$dir"
  fi
done

# Inicia a aplicação com logs detalhados
echo "🚀 Iniciando aplicação Node.js..."
echo "📝 Comando: node --trace-warnings dist/index.js"
exec node --trace-warnings dist/index.js 