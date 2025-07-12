const axios = require('axios');

async function testProducaoMapa() {
  const urls = [
    'https://api.painelsegtrack.com.br/api/prestadores/mapa',
    'https://api.painelsegtrack.com.br/api/test',
    'https://api.painelsegtrack.com.br/api/prestadores/public'
  ];

  console.log('🔍 Testando API de produção...\n');

  for (const url of urls) {
    try {
      console.log(`📡 Testando: ${url}`);
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'SegTrack-Test/1.0'
        }
      });

      console.log('✅ Status:', response.status);
      console.log('✅ Content-Type:', response.headers['content-type']);
      console.log('✅ Data type:', typeof response.data);
      console.log('✅ Is array:', Array.isArray(response.data));
      
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        console.log('❌ ERRO: Recebendo HTML em vez de JSON!');
        console.log('❌ Isso indica que a rota não existe em produção.');
        console.log('❌ Primeiros 200 caracteres:', response.data.substring(0, 200));
      } else if (Array.isArray(response.data)) {
        console.log('✅ Array length:', response.data.length);
        if (response.data.length > 0) {
          console.log('✅ Sample item:', JSON.stringify(response.data[0], null, 2));
        }
      } else {
        console.log('✅ Dados recebidos:', JSON.stringify(response.data, null, 2));
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

console.log('🚀 Testando endpoints de produção...');
testProducaoMapa().catch(console.error); 