const axios = require('axios');

async function testOcorrencia2() {
  try {
    console.log('Testing occurrence 2...');
    
    // Test basic health check first
    const healthResponse = await axios.get('http://localhost:8080/api/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test if occurrence 2 exists (without auth for now)
    try {
      const getResponse = await axios.get('http://localhost:8080/api/ocorrencias/2');
      console.log('✅ Occurrence 2 exists:', getResponse.data);
      
      // Test update with simple payload
      const updatePayload = {
        inicio: '2024-01-15T10:30:00.000Z',
        chegada: '2024-01-15T11:00:00.000Z',
        termino: '2024-01-15T12:00:00.000Z'
      };
      
      console.log('🔍 Testing update with payload:', updatePayload);
      
      const updateResponse = await axios.put('http://localhost:8080/api/ocorrencias/2', updatePayload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Update successful:', updateResponse.data);
      
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data);
      console.log('❌ Error message:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running on port 8080');
    }
  }
}

testOcorrencia2(); 