const axios = require('axios');

const API_URLS = [
  'http://localhost:8080/api/prestadores/mapa',
  'https://api.painelsegtrack.com.br/api/prestadores/mapa'
];

async function testMapaEndpoint() {
  console.log('🧪 Testando endpoint /prestadores/mapa...\n');

  for (const url of API_URLS) {
    try {
      console.log(`📡 Testando: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Status:', response.status);
      console.log('✅ Headers:', response.headers);
      console.log('✅ Data type:', typeof response.data);
      console.log('✅ Is array:', Array.isArray(response.data));
      console.log('✅ Data length:', Array.isArray(response.data) ? response.data.length : 'N/A');
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('✅ Sample data:', response.data[0]);
      }
      
      console.log('---\n');
    } catch (error) {
      console.log('❌ Erro:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      console.log('---\n');
    }
  }
}

testMapaEndpoint().catch(console.error); 