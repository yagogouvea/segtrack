// Script para testar o endpoint do mapa
const axios = require('axios');

async function testMapaEndpoint() {
  try {
    console.log('🧪 Testando endpoint /api/v1/prestadores/mapa...');
    
    // Primeiro, fazer login para obter um token
    const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'admin@segtrack.com.br',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado, token obtido');
    
    // Testar o endpoint do mapa
    const mapaResponse = await axios.get('http://localhost:8080/api/v1/prestadores/mapa', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Endpoint do mapa funcionou!');
    console.log('📊 Dados retornados:', {
      total: Array.isArray(mapaResponse.data) ? mapaResponse.data.length : 'N/A',
      sample: Array.isArray(mapaResponse.data) && mapaResponse.data.length > 0 ? mapaResponse.data[0] : 'N/A'
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoint:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testMapaEndpoint(); 