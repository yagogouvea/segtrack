const axios = require('axios');

const API_BASE = 'http://192.168.15.4:8080/api';

async function testarRotas() {
  try {
    console.log('🧪 Testando rotas...');
    
    // Teste 1: Rota básica
    console.log('\n1️⃣ Testando rota básica...');
    const basicResponse = await axios.get(`${API_BASE}`);
    console.log('✅ Rota básica:', basicResponse.data);
    
    // Teste 2: Rota protegida sem token
    console.log('\n2️⃣ Testando rota protegida sem token...');
    try {
      await axios.get(`${API_BASE}/protected-prestador/test`);
    } catch (error) {
      console.log('✅ Erro esperado (sem token):', error.response?.data?.message);
    }
    
    // Teste 3: Login
    console.log('\n3️⃣ Testando login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/prestador/login`, {
      email: 'yago@segtrackpr.com.br',
      senha: '39623056885'
    });
    console.log('✅ Login:', loginResponse.data);
    
    const token = loginResponse.data.token;
    
    // Teste 4: Rota protegida com token
    console.log('\n4️⃣ Testando rota protegida com token...');
    const authResponse = await axios.get(`${API_BASE}/protected-prestador/test`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Autenticação:', authResponse.data);
    
    // Teste 5: Ocorrências
    console.log('\n5️⃣ Testando ocorrências...');
    const ocorrenciasResponse = await axios.get(`${API_BASE}/protected-prestador/prestador/ocorrencias`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Ocorrências:', ocorrenciasResponse.data);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testarRotas(); 