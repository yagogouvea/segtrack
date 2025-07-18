require('dotenv').config();

console.log('🔍 TESTE DE CARREGAMENTO DE VARIÁVEIS DE AMBIENTE');
console.log('==================================================');

console.log('\n📋 VARIÁVEIS CARREGADAS:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'DEFINIDA' : 'NÃO DEFINIDA');
console.log('BASE_URL:', process.env.BASE_URL || 'NÃO DEFINIDA');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NÃO DEFINIDA');
console.log('PORT:', process.env.PORT || '8080');

// Testar se o arquivo .env foi carregado
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
console.log('\n📁 VERIFICANDO ARQUIVO .ENV:');
console.log('Caminho do .env:', envPath);
console.log('Arquivo existe:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Tamanho do arquivo:', envContent.length, 'caracteres');
  console.log('Primeiras 200 chars:', envContent.substring(0, 200));
}

// Testar se as variáveis críticas estão definidas
console.log('\n🔍 VERIFICAÇÃO CRÍTICA:');

if (!process.env.DATABASE_URL) {
  console.log('❌ CRÍTICO: DATABASE_URL não está definida');
} else {
  console.log('✅ DATABASE_URL está definida');
}

if (!process.env.JWT_SECRET) {
  console.log('❌ CRÍTICO: JWT_SECRET não está definida');
} else {
  console.log('✅ JWT_SECRET está definida');
}

console.log('\n🔧 SOLUÇÕES:');
console.log('1. Se as variáveis não estão definidas, verifique se o arquivo .env existe');
console.log('2. Se o arquivo existe mas as variáveis não carregam, verifique a sintaxe');
console.log('3. Certifique-se de que não há espaços extras ou caracteres especiais');
console.log('4. Reinicie o servidor após modificar o .env'); 