const jwt = require('jsonwebtoken');

// Token de teste
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

console.log('🔍 Testando validação de token...');

// Verificar se JWT_SECRET está definido
console.log('🔑 JWT_SECRET definido:', !!process.env.JWT_SECRET);
if (process.env.JWT_SECRET) {
  console.log('🔑 JWT_SECRET length:', process.env.JWT_SECRET.length);
}

try {
  // Tentar decodificar o token
  const decoded = jwt.verify(testToken, process.env.JWT_SECRET || 'fallback-secret');
  console.log('✅ Token decodificado com sucesso');
  console.log('📊 Payload:', decoded);
} catch (error) {
  console.log('❌ Erro ao decodificar token');
  console.log('📥 Error:', error.message);
}

// Testar com um token real (se disponível)
if (process.env.JWT_SECRET) {
  try {
    // Criar um token de teste válido
    const testPayload = {
      sub: '1234567890',
      nome: 'Teste User',
      email: 'teste@example.com',
      role: 'admin',
      permissions: ['read:ocorrencia', 'update:ocorrencia', 'read:foto']
    };
    
    const validToken = jwt.sign(testPayload, process.env.JWT_SECRET);
    console.log('\n🔑 Token válido criado:', validToken);
    
    // Verificar o token válido
    const verified = jwt.verify(validToken, process.env.JWT_SECRET);
    console.log('✅ Token válido verificado com sucesso');
    console.log('📊 Payload:', verified);
  } catch (error) {
    console.log('❌ Erro ao criar/verificar token válido');
    console.log('📥 Error:', error.message);
  }
} 