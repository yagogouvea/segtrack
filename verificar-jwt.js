require('dotenv').config();
const jwt = require('jsonwebtoken');

console.log('🔍 Verificando configuração JWT...');
console.log('');

// Verificar se JWT_SECRET está definido
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET não está definido!');
  process.exit(1);
}

console.log('✅ JWT_SECRET está definido');
console.log('📝 Valor:', process.env.JWT_SECRET.substring(0, 10) + '...');

// Testar geração e verificação de token
try {
  const testPayload = {
    id: 'test-user-id',
    email: 'test@example.com',
    nome: 'Usuário Teste',
    tipo: 'prestador'
  };

  console.log('');
  console.log('🧪 Testando geração de token...');
  
  const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log('✅ Token gerado com sucesso');
  console.log('🔑 Token:', token.substring(0, 20) + '...');

  console.log('');
  console.log('🔍 Testando verificação de token...');
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✅ Token verificado com sucesso');
  console.log('📋 Payload decodificado:', decoded);

  console.log('');
  console.log('🎉 JWT está funcionando corretamente!');
  console.log('💡 Agora você pode reiniciar o backend e fazer login novamente.');

} catch (error) {
  console.error('❌ Erro ao testar JWT:', error.message);
  process.exit(1);
} 