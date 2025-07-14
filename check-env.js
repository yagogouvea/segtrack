require('dotenv').config();

console.log('🔍 Verificando variáveis de ambiente...');

const requiredVars = [
  'NODE_ENV',
  'PORT', 
  'DATABASE_URL',
  'JWT_SECRET',
  'BASE_URL',
  'FRONTEND_URL'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') ? 'PRESENTE' : value}`);
  } else {
    console.log(`❌ ${varName}: AUSENTE`);
    allPresent = false;
  }
});

if (allPresent) {
  console.log('✅ Todas as variáveis de ambiente estão presentes');
} else {
  console.log('❌ Algumas variáveis de ambiente estão ausentes');
} 