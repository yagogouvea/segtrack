const axios = require('axios');

async function testBrowserAPI() {
  const baseURL = 'https://api.painelsegtrack.com.br';
  const endpoints = [
    '/api/prestadores/mapa',
    '/api/prestadores/public',
    '/api/prestadores'
  ];

  console.log('🌐 Testando API como se fosse chamada pelo navegador...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testando: ${baseURL}${endpoint}`);
      
      const response = await axios.get(`${baseURL}${endpoint}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin': 'https://app.painelsegtrack.com.br',
          'Referer': 'https://app.painelsegtrack.com.br/'
        }
      });

      console.log('✅ Status:', response.status);
      console.log('✅ Content-Type:', response.headers['content-type']);
      console.log('✅ Data type:', typeof response.data);
      console.log('✅ Is array:', Array.isArray(response.data));
      
      if (Array.isArray(response.data)) {
        console.log('✅ Array length:', response.data.length);
        if (response.data.length > 0) {
          console.log('✅ First item:', {
            id: response.data[0].id,
            nome: response.data[0].nome,
            latitude: response.data[0].latitude,
            longitude: response.data[0].longitude
          });
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
    
    console.log('---\n');
  }
}

testBrowserAPI().catch(console.error); 