const jwt = require('jsonwebtoken');

async function testJWTSecret() {
  try {
    console.log('🔍 Testando JWT_SECRET...');
    
    // Verificar se JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET não está definido');
      return;
    }
    
    console.log('✅ JWT_SECRET está definido');
    console.log('Secret:', process.env.JWT_SECRET.substring(0, 20) + '...');
    
    // Criar um token de teste
    const payload = {
      id: 'bf14f882-d92c-4eff-80f2-dfcb12d4d595',
      email: 'yago@segtrackpr.com.br',
      nome: 'Yago Gouvea',
      tipo: 'prestador'
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });
    console.log('✅ Token gerado:', token.substring(0, 50) + '...');
    
    // Verificar o token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verificado com sucesso');
      console.log('Payload decodificado:', decoded);
    } catch (verifyError) {
      console.log('❌ Erro ao verificar token:', verifyError.message);
    }
    
    // Testar com um token real do frontend
    const realToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJmMTRmODgyLWQ5MmMtNGVmZi04MGYyLWRmY2IxMmQ0ZDU5NSIsImVtYWlsIjoieWFnb0BzZWd0cmFja3ByLmNvbS5iciIsIm5vbWUiOiJZYWdvIEdvdXZlYSIsInRpcG8iOiJwcmVzdGFkb3IiLCJpYXQiOjE3NTI3MDkyMzYsImV4cCI6MTc1MjcxMjgyM30.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
    
    try {
      const decodedReal = jwt.verify(realToken, process.env.JWT_SECRET);
      console.log('✅ Token real verificado com sucesso');
      console.log('Payload do token real:', decodedReal);
    } catch (verifyError) {
      console.log('❌ Erro ao verificar token real:', verifyError.message);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testJWTSecret(); 