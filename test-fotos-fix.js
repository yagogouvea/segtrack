const axios = require('axios');

// Configuração
const API_URL = 'https://api.painelsegtrack.com.br';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'; // Token de teste

async function testFotosFix() {
  try {
    console.log('🔍 Testando correção do problema de fotos...');
    
    // Teste 1: Verificar se a rota de teste está funcionando
    console.log('\n📋 Teste 1: Rota de teste de fotos');
    try {
      const response = await axios.get(`${API_URL}/api/fotos/test`);
      console.log('✅ GET /api/fotos/test - Sucesso');
      console.log('📊 Resposta:', response.data);
    } catch (error) {
      console.log('❌ GET /api/fotos/test - Erro');
      console.log('📥 Status:', error.response?.status);
      console.log('📥 Data:', error.response?.data);
    }
    
    // Teste 2: Verificar se a rota de fotos por ocorrência está funcionando
    console.log('\n📋 Teste 2: Fotos por ocorrência');
    try {
      const response = await axios.get(`${API_URL}/api/fotos/por-ocorrencia/94`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ GET /api/fotos/por-ocorrencia/94 - Sucesso');
      console.log('📊 Total de fotos:', response.data.length);
      if (response.data.length > 0) {
        console.log('📸 Primeira foto:', {
          id: response.data[0].id,
          url: response.data[0].url,
          legenda: response.data[0].legenda
        });
      }
    } catch (error) {
      console.log('❌ GET /api/fotos/por-ocorrencia/94 - Erro');
      console.log('📥 Status:', error.response?.status);
      console.log('📥 Data:', error.response?.data);
    }
    
    // Teste 3: Verificar se a rota de fotos por ocorrência sem token funciona
    console.log('\n📋 Teste 3: Fotos por ocorrência sem token');
    try {
      const response = await axios.get(`${API_URL}/api/fotos/por-ocorrencia/94`);
      console.log('✅ GET /api/fotos/por-ocorrencia/94 (sem token) - Sucesso');
      console.log('📊 Total de fotos:', response.data.length);
    } catch (error) {
      console.log('❌ GET /api/fotos/por-ocorrencia/94 (sem token) - Erro');
      console.log('📥 Status:', error.response?.status);
      console.log('📥 Data:', error.response?.data);
    }
    
  } catch (error) {
    console.log('❌ Erro geral no teste!');
    console.log('📥 Error:', error.message);
  }
}

testFotosFix(); 