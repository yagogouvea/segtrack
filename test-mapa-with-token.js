// Teste usando token que funciona no frontend
const axios = require('axios');

async function testMapaWithToken() {
  try {
    console.log('🧪 Testando endpoint com token do frontend...');
    
    // Token que está funcionando no frontend (do log)
    const token = 'eyJhbGciOiJIUzI1NiIs...'; // Token do log do frontend
    
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
      data: error.response?.data
    });
  }
}

testMapaWithToken(); 