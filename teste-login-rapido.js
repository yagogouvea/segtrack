const axios = require('axios');

const API_BASE = 'http://192.168.15.4:8080/api';

async function testarLoginRapido() {
  try {
    console.log('🧪 Testando login rápido...');
    
    const response = await axios.post(`${API_BASE}/auth/prestador/login`, {
      email: 'yago@segtrackpr.com.br',
      senha: '39623056885'
    });
    
    console.log('✅ Login bem-sucedido:');
    console.log('Token:', response.data.token ? 'Sim' : 'Não');
    console.log('Prestador:', response.data.prestador ? 'Sim' : 'Não');
    console.log('Nome:', response.data.prestador?.nome || 'Não encontrado');
    console.log('Estrutura completa:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testarLoginRapido(); 