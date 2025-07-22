const axios = require('axios');

const API_BASE = 'http://192.168.15.4:8080/api';

async function testarOcorrenciasComToken() {
  try {
    console.log('🧪 Testando ocorrências com token...');
    
    // Primeiro fazer login para obter o token
    const loginResponse = await axios.post(`${API_BASE}/auth/prestador/login`, {
      email: 'yago@segtrackpr.com.br',
      senha: '39623056885'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtido:', token ? 'Sim' : 'Não');
    
    // Agora testar a rota de ocorrências com o token
    const ocorrenciasResponse = await axios.get(`${API_BASE}/protected-prestador/prestador/ocorrencias`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Ocorrências obtidas com sucesso:');
    console.log('Total de ocorrências:', ocorrenciasResponse.data.ocorrencias?.length || 0);
    console.log('Prestador:', ocorrenciasResponse.data.prestador?.nome);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testarOcorrenciasComToken(); 