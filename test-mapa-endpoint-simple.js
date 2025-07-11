const axios = require('axios');

async function testMapaEndpoint() {
  const urls = [
    'http://localhost:8080/api/prestadores/mapa',
    'https://api.painelsegtrack.com.br/api/prestadores/mapa'
  ];
  
  for (const url of urls) {
    try {
      console.log(`\n🧪 Testando endpoint: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Status:', response.status);
      console.log('✅ Content-Type:', response.headers['content-type']);
      console.log('✅ Data type:', typeof response.data);
      console.log('✅ Is array:', Array.isArray(response.data));
      
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.log('❌ ERRO: Recebendo HTML em vez de JSON!');
        console.log('❌ Isso indica que a rota não está registrada corretamente.');
        console.log('❌ Primeiros 200 caracteres da resposta:', response.data.substring(0, 200));
      } else if (Array.isArray(response.data)) {
        console.log('✅ Array length:', response.data.length);
        if (response.data.length > 0) {
          console.log('✅ Sample item:', response.data[0]);
        }
      } else {
        console.log('❌ Data is not an array:', response.data);
      }
      
    } catch (error) {
      console.log('❌ Erro:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
  }
}

console.log('🔍 Testando endpoints do mapa...');
testMapaEndpoint().catch(console.error); 