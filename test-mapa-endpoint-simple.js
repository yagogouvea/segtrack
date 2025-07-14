// Teste simples para verificar o endpoint do mapa
const axios = require('axios');

async function testMapaEndpoint() {
  try {
    console.log('🧪 Testando endpoint /api/v1/prestadores/mapa...');
    
    // Testar sem autenticação primeiro
    console.log('📡 Testando sem autenticação...');
    try {
      const response = await axios.get('http://localhost:8080/api/v1/prestadores/mapa');
      console.log('❌ Erro: Endpoint acessível sem autenticação!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint protegido corretamente (401)');
      } else {
        console.log('⚠️ Status inesperado:', error.response?.status);
      }
    }
    
    // Testar com autenticação
    console.log('\n📡 Testando com autenticação...');
    const loginResponse = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'yago@segtrack',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');
    
    const mapaResponse = await axios.get('http://localhost:8080/api/v1/prestadores/mapa', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Endpoint funcionou!');
    console.log('📊 Total de prestadores:', Array.isArray(mapaResponse.data) ? mapaResponse.data.length : 'N/A');
    
    if (Array.isArray(mapaResponse.data) && mapaResponse.data.length > 0) {
      console.log('📋 Primeiro prestador:', {
        id: mapaResponse.data[0].id,
        nome: mapaResponse.data[0].nome,
        latitude: mapaResponse.data[0].latitude,
        longitude: mapaResponse.data[0].longitude
      });
    }
    
  } catch (error) {
    console.error('❌ Erro detalhado:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
  }
}

testMapaEndpoint(); 