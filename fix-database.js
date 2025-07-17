const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo DATABASE_URL...');

// Ler o arquivo .env atual
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Arquivo .env encontrado');
} catch (error) {
  console.log('❌ Arquivo .env não encontrado, criando novo...');
  envContent = '';
}

// Substituir a linha DATABASE_URL
const oldDatabaseUrl = 'DATABASE_URL="postgresql://segtrack_admin:3500@17V440g@tramway.proxy.rlwy.net:15957/segtrack"';
const newDatabaseUrl = 'DATABASE_URL="postgresql://postgres:BBIosMGvETUoYSvAVqqWnwcxUSDhFeTeq@shortline.proxy.rlwy.net:15684/railway"';

if (envContent.includes(oldDatabaseUrl)) {
  envContent = envContent.replace(oldDatabaseUrl, newDatabaseUrl);
  console.log('✅ DATABASE_URL atualizada');
} else if (envContent.includes('DATABASE_URL=')) {
  // Se já existe uma DATABASE_URL, substituir
  envContent = envContent.replace(/DATABASE_URL="[^"]*"/, newDatabaseUrl);
  console.log('✅ DATABASE_URL substituída');
} else {
  // Se não existe, adicionar
  envContent += `\n${newDatabaseUrl}\n`;
  console.log('✅ DATABASE_URL adicionada');
}

// Garantir que as outras variáveis existam
const requiredVars = [
  'JWT_SECRET="segtrack-jwt-secret-2024-super-seguro-xyz123"',
  'BASE_URL="http://localhost:8080"',
  'FRONTEND_URL="http://localhost:3000"',
  'NODE_ENV="development"'
];

requiredVars.forEach(varLine => {
  const varName = varLine.split('=')[0];
  if (!envContent.includes(varName)) {
    envContent += `\n${varLine}\n`;
    console.log(`✅ ${varName} adicionada`);
  }
});

// Salvar o arquivo
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env atualizado com sucesso!');
  console.log('🔄 Reinicie o backend para aplicar as mudanças');
} catch (error) {
  console.error('❌ Erro ao salvar arquivo .env:', error.message);
} 