const axios = require('axios');

async function testMapaEndpoint() {
  try {
    console.log('🔍 Testando endpoint /v1/prestadores/mapa...');
    
    const response = await axios.get('http://localhost:8080/api/v1/prestadores/mapa', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbkBzZWd0cmFjayIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMTQ0NzE0NiwiZXhwIjoxNzMxNTMzNTQ2fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
      },
      timeout: 10000
    });
    
    console.log('✅ Endpoint funcionando!');
    console.log('📊 Status:', response.status);
    console.log('📊 Dados recebidos:', response.data.length, 'prestadores');
    
    if (response.data.length > 0) {
      console.log('📊 Primeiro prestador:', {
        id: response.data[0].id,
        nome: response.data[0].nome,
        latitude: response.data[0].latitude,
        longitude: response.data[0].longitude
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoint:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

testMapaEndpoint(); 