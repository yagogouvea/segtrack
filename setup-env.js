const fs = require('fs');
const path = require('path');

function setupEnv() {
  try {
    console.log('🔧 Configurando arquivo .env...');
    
    const envContent = `# 🔗 CONFIGURAÇÃO DO BANCO DE DADOS
# Copie este arquivo para .env e configure com suas credenciais

# Para Railway (copie a URL do Railway Dashboard)
DATABASE_URL="postgresql://usuario:senha@tramway.proxy.rlwy.net:15957/segtrack"

# Para desenvolvimento local
# DATABASE_URL="postgresql://usuario:senha@localhost:5432/segtrack"

# 🔐 CONFIGURAÇÕES JWT
JWT_SECRET="segtrack-jwt-secret-2024-super-seguro-xyz123"

# ⚙️ CONFIGURAÇÕES DO SERVIDOR
NODE_ENV="development"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
LOG_LEVEL="info"

# 🌐 CONFIGURAÇÕES CORS (opcional)
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
`;

    const envPath = path.join(__dirname, '.env');
    
    // Verificar se o arquivo já existe
    if (fs.existsSync(envPath)) {
      console.log('⚠️ Arquivo .env já existe. Fazendo backup...');
      const backupPath = path.join(__dirname, '.env.backup');
      fs.copyFileSync(envPath, backupPath);
      console.log('✅ Backup criado em .env.backup');
    }
    
    // Criar/atualizar o arquivo .env
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env criado/atualizado com sucesso!');
    console.log('📁 Localização:', envPath);
    
    // Verificar se as variáveis estão sendo carregadas
    console.log('\n🔍 Verificando variáveis de ambiente...');
    require('dotenv').config();
    
    if (process.env.JWT_SECRET) {
      console.log('✅ JWT_SECRET está configurado');
      console.log('Secret:', process.env.JWT_SECRET.substring(0, 20) + '...');
    } else {
      console.log('❌ JWT_SECRET não está configurado');
    }
    
    if (process.env.DATABASE_URL) {
      console.log('✅ DATABASE_URL está configurado');
    } else {
      console.log('❌ DATABASE_URL não está configurado');
    }
    
    console.log('\n🎉 Configuração concluída!');
    console.log('💡 Agora você pode reiniciar o backend para aplicar as mudanças.');
    
  } catch (error) {
    console.error('❌ Erro ao configurar .env:', error.message);
  }
}

setupEnv(); 