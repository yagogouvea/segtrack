const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

async function testClienteAuth() {
  console.log('🧪 Testando Autenticação de Clientes SEGTRACK');
  console.log('=============================================\n');

  try {
    // Teste 1: Cadastrar novo cliente
    console.log('1️⃣ Testando cadastro de cliente...');
    const clienteData = {
      razaoSocial: 'EMPRESA TESTE LTDA',
      cnpj: '00.000.000/0001-00'
    };

    const cadastroResponse = await axios.post(`${API_BASE_URL}/auth/cliente/cadastro`, clienteData);
    console.log('✅ Cliente cadastrado com sucesso:', cadastroResponse.data);
    console.log('');

    // Teste 2: Login do cliente
    console.log('2️⃣ Testando login do cliente...');
    const loginData = {
      cnpj: '00.000.000/0001-00',
      senha: '00000000000100' // CNPJ normalizado
    };

    const loginResponse = await axios.post(`${API_BASE_URL}/auth/cliente/login`, loginData);
    console.log('✅ Login realizado com sucesso:', {
      token: loginResponse.data.token ? 'Token gerado' : 'Sem token',
      cliente: loginResponse.data.cliente
    });
    console.log('');

    // Teste 3: Acessar rota protegida
    console.log('3️⃣ Testando acesso a rota protegida...');
    const token = loginResponse.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const perfilResponse = await axios.get(`${API_BASE_URL}/protected/cliente/perfil`, { headers });
    console.log('✅ Perfil do cliente acessado:', perfilResponse.data);
    console.log('');

    // Teste 4: Acessar ocorrências do cliente
    console.log('4️⃣ Testando acesso às ocorrências...');
    const ocorrenciasResponse = await axios.get(`${API_BASE_URL}/protected/cliente/ocorrencias`, { headers });
    console.log('✅ Ocorrências do cliente:', ocorrenciasResponse.data);
    console.log('');

    // Teste 5: Acessar relatórios do cliente
    console.log('5️⃣ Testando acesso aos relatórios...');
    const relatoriosResponse = await axios.get(`${API_BASE_URL}/protected/cliente/relatorios`, { headers });
    console.log('✅ Relatórios do cliente:', relatoriosResponse.data);
    console.log('');

    console.log('🎉 Todos os testes passaram com sucesso!');
    console.log('=============================================');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
  }
}

// Executar os testes
testClienteAuth(); 