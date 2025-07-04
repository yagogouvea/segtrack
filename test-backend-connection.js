const axios = require('axios');

async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    
    // Test basic health check
    const healthResponse = await axios.get('http://localhost:8080/api/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test basic API endpoint
    const apiResponse = await axios.get('http://localhost:8080/api');
    console.log('✅ API endpoint working:', apiResponse.data);
    
    // Test if occurrence 2 exists (without auth for now)
    try {
      const ocorrenciaResponse = await axios.get('http://localhost:8080/api/ocorrencias/2');
      console.log('✅ Occurrence 2 exists:', ocorrenciaResponse.data);
    } catch (error) {
      console.log('❌ Occurrence 2 not found or auth required:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running on port 8080');
    }
  }
}

testBackendConnection(); 