const axios = require('axios');

const API_BASE = 'http://localhost:8080/api/v1';

// Token de teste (substitua por um token válido)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0ZUBleGFtcGxlLmNvbSIsImlhdCI6MTczNzE3NDg0NywiZXhwIjoxNzM3MjYxMjQ3fQ.example';

async function testMonitoramento() {
  console.log('🧪 Testando endpoint de monitoramento...\n');

  const testData = {
    prestadorId: '1',
    ocorrenciaId: '123',
    latitude: -23.55052,
    longitude: -46.633308,
    timestamp: new Date().toISOString()
  };

  try {
    console.log('📡 Testando POST /api/v1/monitoramento/posicao');
    console.log('📋 Dados de teste:', testData);
    
    const response = await axios.post(`${API_BASE}/monitoramento/posicao`, testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      timeout: 10000
    });

    console.log('✅ Status:', response.status);
    console.log('✅ Resposta:', response.data);
    
  } catch (error) {
    console.log('❌ Erro:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }

  console.log('\n---\n');

  // Testar com dados inválidos
  try {
    console.log('📡 Testando com dados inválidos...');
    
    const invalidData = {
      prestadorId: '1',
      ocorrenciaId: '123',
      latitude: 'invalid',
      longitude: 'invalid',
      timestamp: new Date().toISOString()
    };

    const response = await axios.post(`${API_BASE}/monitoramento/posicao`, invalidData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      timeout: 10000
    });

    console.log('✅ Status:', response.status);
    console.log('✅ Resposta:', response.data);
    
  } catch (error) {
    console.log('❌ Erro esperado:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }

  console.log('\n---\n');

  // Testar sem token
  try {
    console.log('📡 Testando sem token de autenticação...');
    
    const response = await axios.post(`${API_BASE}/monitoramento/posicao`, testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Status:', response.status);
    console.log('✅ Resposta:', response.data);
    
  } catch (error) {
    console.log('❌ Erro esperado (sem autenticação):', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

// Executar teste
testMonitoramento().catch(console.error); 