const axios = require('axios');

// Configuração
const API_URL = 'https://api.painelsegtrack.com.br';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'; // Token de teste

async function testOcorrenciasFix() {
  try {
    console.log('🔍 Testando correção do problema de KM...');
    
    // Teste 1: Verificar se a rota está funcionando
    console.log('\n📋 Teste 1: Verificar rota de ocorrências');
    try {
      const response = await axios.get(`${API_URL}/api/ocorrencias`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ GET /api/ocorrencias - Sucesso');
      console.log('📊 Total de ocorrências:', response.data.length);
      
      if (response.data.length > 0) {
        const primeiraOcorrencia = response.data[0];
        console.log('📋 Primeira ocorrência:', primeiraOcorrencia.id);
        
        // Teste 2: Atualizar KM da primeira ocorrência
        console.log('\n✏️ Teste 2: Atualizar KM da ocorrência');
        try {
          const updateData = {
            km: 150.5,
            km_inicial: 1000,
            km_final: 1150.5
          };
          
          const updateResponse = await axios.put(`${API_URL}/api/ocorrencias/${primeiraOcorrencia.id}`, updateData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('✅ PUT /api/ocorrencias - Sucesso');
          console.log('📋 Ocorrência atualizada:', updateResponse.data.id);
          console.log('📊 KM atualizado:', updateResponse.data.km);
        } catch (error) {
          console.log('❌ PUT /api/ocorrencias - Erro:', error.response?.status, error.response?.data);
        }
      }
    } catch (error) {
      console.log('❌ GET /api/ocorrencias - Erro:', error.response?.status, error.response?.data);
    }

    // Teste 3: Verificar rota de teste
    console.log('\n🔍 Teste 3: Verificar rota de teste');
    try {
      const response = await axios.put(`${API_URL}/api/ocorrencias/1/test`, {
        km: 100,
        km_inicial: 1000,
        km_final: 1100
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ PUT /api/ocorrencias/1/test - Sucesso');
      console.log('📋 Resposta:', response.data);
    } catch (error) {
      console.log('❌ PUT /api/ocorrencias/1/test - Erro:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testOcorrenciasFix(); 