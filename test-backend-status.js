const axios = require('axios');

async function testBackendStatus() {
  const testUrls = [
    'http://localhost:8080/api/test',
    'http://localhost:8080/api/prestadores/mapa',
    'https://api.painelsegtrack.com.br/api/test',
    'https://api.painelsegtrack.com.br/api/prestadores/mapa'
  ];

  console.log('🔍 Testando status do backend...\n');

  for (const url of testUrls) {
    try {
      console.log(`📡 Testando: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('✅ Status:', response.status);
      console.log('✅ Content-Type:', response.headers['content-type']);
      
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.log('❌ Recebendo HTML (rota não encontrada)');
        console.log('❌ Primeiros 100 chars:', response.data.substring(0, 100));
      } else {
        console.log('✅ Recebendo JSON:', typeof response.data);
        if (Array.isArray(response.data)) {
          console.log('✅ É um array com', response.data.length, 'itens');
        } else {
          console.log('✅ Dados:', response.data);
        }
      }
      
    } catch (error) {
      console.log('❌ Erro:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    }
    
    console.log('---\n');
  }
}

testBackendStatus(); 