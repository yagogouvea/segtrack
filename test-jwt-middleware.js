const jwt = require('jsonwebtoken');

async function testJWTMiddleware() {
  try {
    console.log('🔍 Testando JWT_SECRET e middleware...');
    
    // Verificar se JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET não está definido');
      console.log('Variáveis de ambiente disponíveis:', Object.keys(process.env).filter(key => key.includes('JWT')));
      return;
    }
    
    console.log('✅ JWT_SECRET está definido');
    console.log('Secret:', process.env.JWT_SECRET.substring(0, 20) + '...');
    
    // Criar um token de teste com payload similar ao do prestador
    const payload = {
      id: 'bf14f882-d92c-4eff-80f2-dfcb12d4d595',
      email: 'yago@segtrackpr.com.br',
      nome: 'Yago Gouvea',
      tipo: 'prestador',
      sub: 'bf14f882-d92c-4eff-80f2-dfcb12d4d595'
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });
    console.log('✅ Token gerado:', token.substring(0, 50) + '...');
    
    // Verificar o token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verificado com sucesso');
      console.log('Payload decodificado:', decoded);
    } catch (error) {
      console.log('❌ Erro ao verificar token:', error.message);
    }
    
    // Testar com axios para simular a requisição real
    const axios = require('axios');
    
    console.log('\n🌐 Testando requisição real...');
    
    // 1. Fazer login para obter token válido
    const loginResponse = await axios.post('http://localhost:8080/api/prestador/login', {
      email: 'yago@segtrackpr.com.br',
      senha: '39623056885'
    });
    
    console.log('✅ Login bem-sucedido');
    const realToken = loginResponse.data.token;
    console.log('Token real:', realToken.substring(0, 50) + '...');
    
    // 2. Testar o token na rota protegida
    try {
      const protectedResponse = await axios.get('http://localhost:8080/api/protected-prestador/prestador/ocorrencias', {
        headers: {
          'Authorization': `Bearer ${realToken}`
        }
      });
      
      console.log('✅ Requisição protegida bem-sucedida');
      console.log('Status:', protectedResponse.status);
      console.log('Dados:', protectedResponse.data);
    } catch (error) {
      console.log('❌ Erro na requisição protegida:');
      console.log('Status:', error.response?.status);
      console.log('Mensagem:', error.response?.data);
      console.log('Headers:', error.response?.headers);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testJWTMiddleware(); 