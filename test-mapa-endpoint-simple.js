const axios = require('axios');

async function testMapaEndpoint() {
  const url = 'http://localhost:8080/api/prestadores/mapa';
  
  try {
    console.log('🧪 Testando endpoint:', url);
    
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('✅ Status:', response.status);
    console.log('✅ Content-Type:', response.headers['content-type']);
    console.log('✅ Data type:', typeof response.data);
    console.log('✅ Is array:', Array.isArray(response.data));
    
    if (Array.isArray(response.data)) {
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
      data: error.response?.data
    });
  }
}

testMapaEndpoint(); 