const axios = require('axios');

async function testDateUpdate() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiVGVzdCBVc2VyIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6Im9wZXJhdG9yIiwiaWF0IjoxNzQ3NDQwMDAwLCJleHAiOjE3NDc1MjY0MDB9.test-signature';
    
    const payload = {
      inicio: '2024-01-15T10:30:00.000Z',
      chegada: '2024-01-15T11:00:00.000Z',
      termino: '2024-01-15T12:00:00.000Z'
    };

    console.log('Testing date update with payload:', payload);

    const response = await axios.put('http://localhost:3000/api/ocorrencias/2', payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Success! Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testDateUpdate(); 