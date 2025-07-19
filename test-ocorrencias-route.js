const axios = require('axios');

// Configuração
const API_URL = 'https://api.painelsegtrack.com.br';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'; // Token de teste

async function testOcorrenciasRoute() {
  try {
    console.log('🔍 Testando rota de ocorrências...');
    
    // Teste 1: GET /api/ocorrencias (listagem)
    console.log('\n📋 Teste 1: Listagem de ocorrências');
    try {
      const response = await axios.get(`${API_URL}/api/ocorrencias`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ GET /api/ocorrencias - Sucesso');
      console.log('📊 Total de ocorrências:', response.data.length);
    } catch (error) {
      console.log('❌ GET /api/ocorrencias - Erro:', error.response?.status, error.response?.data);
    }

    // Teste 2: GET /api/ocorrencias/1 (buscar por ID)
    console.log('\n🔍 Teste 2: Buscar ocorrência por ID');
    try {
      const response = await axios.get(`${API_URL}/api/ocorrencias/1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ GET /api/ocorrencias/1 - Sucesso');
      console.log('📋 Ocorrência encontrada:', response.data.id);
    } catch (error) {
      console.log('❌ GET /api/ocorrencias/1 - Erro:', error.response?.status, error.response?.data);
    }

    // Teste 3: PUT /api/ocorrencias/1 (atualizar)
    console.log('\n✏️ Teste 3: Atualizar ocorrência');
    try {
      const updateData = {
        km: 150.5,
        km_inicial: 1000,
        km_final: 1150.5
      };
      
      const response = await axios.put(`${API_URL}/api/ocorrencias/1`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ PUT /api/ocorrencias/1 - Sucesso');
      console.log('📋 Ocorrência atualizada:', response.data.id);
    } catch (error) {
      console.log('❌ PUT /api/ocorrencias/1 - Erro:', error.response?.status, error.response?.data);
    }

    // Teste 4: Verificar se a rota está sendo interceptada
    console.log('\n🔍 Teste 4: Verificar interceptação de rotas');
    try {
      const response = await axios.get(`${API_URL}/api/ocorrencias/test`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ GET /api/ocorrencias/test - Sucesso');
      console.log('📋 Resposta:', response.data);
    } catch (error) {
      console.log('❌ GET /api/ocorrencias/test - Erro:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testOcorrenciasRoute(); 