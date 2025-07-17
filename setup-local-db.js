const fs = require('fs');
const path = require('path');

console.log('🏠 Configurando banco de dados local...');

const envContent = `# 🔗 CONFIGURAÇÃO DO BANCO DE DADOS
# Para desenvolvimento local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/segtrack"

# 🔐 CONFIGURAÇÕES JWT
JWT_SECRET="segtrack-jwt-secret-2024-super-seguro-xyz123"

# ⚙️ CONFIGURAÇÕES DO SERVIDOR
NODE_ENV="development"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
LOG_LEVEL="info"

# 🌐 CONFIGURAÇÕES CORS (opcional)
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"

# 🔗 URLs DO SISTEMA
BASE_URL="http://localhost:8080"
FRONTEND_URL="http://localhost:3000"
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env configurado para banco local!');
  console.log('');
  console.log('📋 Próximos passos:');
  console.log('1. Instale PostgreSQL: https://www.postgresql.org/download/');
  console.log('2. Crie um banco chamado "segtrack"');
  console.log('3. Use usuário "postgres" com senha "postgres"');
  console.log('4. Execute: npx prisma db push');
  console.log('5. Execute: npm run dev');
} catch (error) {
  console.error('❌ Erro ao configurar:', error.message);
} 