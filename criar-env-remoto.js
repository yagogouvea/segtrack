const fs = require('fs');
const path = require('path');

const envContent = `# 🔗 CONFIGURAÇÃO DO BANCO DE DADOS
# Para desenvolvimento local (usando banco remoto)
DATABASE_URL="postgresql://segtrack_admin:3500@17V440g@tramway.proxy.rlwy.net:15957/segtrack"

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
  console.log('✅ Arquivo .env atualizado com banco remoto!');
  console.log('📁 Localização:', envPath);
  console.log('🔐 JWT_SECRET configurado');
  console.log('🌐 BASE_URL e FRONTEND_URL adicionados');
  console.log('🗄️ Usando banco de dados remoto');
} catch (error) {
  console.error('❌ Erro ao criar arquivo .env:', error.message);
} 