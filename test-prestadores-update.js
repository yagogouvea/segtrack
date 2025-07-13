const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'https://api.painelsegtrack.com.br/api/v1';
const PRESTADOR_ID = 26; // ID do prestador que está falhando

// Token de autenticação (substitua pelo token válido)
const TOKEN = process.env.TEST_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Token de exemplo

async function testPrestadorUpdate() {
  try {
    console.log('🔍 Testando atualização do prestador ID:', PRESTADOR_ID);
    
    // 1. Primeiro, buscar o prestador atual
    console.log('\n📡 1. Buscando prestador atual...');
    const getResponse = await axios.get(`${API_BASE_URL}/prestadores/${PRESTADOR_ID}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Prestador encontrado:', {
      id: getResponse.data.id,
      nome: getResponse.data.nome,
      latitude: getResponse.data.latitude,
      longitude: getResponse.data.longitude
    });
    
    // 2. Preparar dados para atualização
    const updateData = {
      nome: 'Adriano Alves Portela',
      cpf: '84381000153',
      cod_nome: 'ADRIANO DF',
      telefone: '(61) 9826-0610',
      email: 'adriano@teste.com',
      tipo_pix: 'cpf',
      chave_pix: '84381000153',
      cep: '70000-000',
      endereco: 'Teste de Endereço',
      bairro: 'Centro',
      cidade: 'Brasília',
      estado: 'DF',
      funcoes: [{ funcao: 'Segurança' }],
      regioes: [{ regiao: 'Brasília' }],
      tipo_veiculo: [{ tipo: 'Carro' }],
      latitude: -15.7801,
      longitude: -47.9292,
      aprovado: true,
      valor_acionamento: '50.00',
      valor_hora_adc: '30.00',
      valor_km_adc: '2.00',
      franquia_km: '50',
      franquia_horas: '2'
    };
    
    console.log('\n📡 2. Tentando atualizar prestador...');
    console.log('📦 Dados sendo enviados:', JSON.stringify(updateData, null, 2));
    
    // 3. Tentar atualizar
    const putResponse = await axios.put(`${API_BASE_URL}/prestadores/${PRESTADOR_ID}`, updateData, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Prestador atualizado com sucesso!');
    console.log('📊 Resposta:', putResponse.data);
    
  } catch (error) {
    console.error('❌ Erro ao testar atualização:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Se for erro 500, tentar diagnosticar
    if (error.response?.status === 500) {
      console.log('\n🔍 Diagnóstico do erro 500:');
      console.log('1. Verificar se o prestador existe');
      console.log('2. Verificar se os dados estão no formato correto');
      console.log('3. Verificar logs do backend');
      console.log('4. Verificar se há problemas de validação');
    }
  }
}

async function testPrestadorGet() {
  try {
    console.log('\n🔍 Testando busca de prestadores...');
    
    const response = await axios.get(`${API_BASE_URL}/prestadores`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Lista de prestadores obtida com sucesso!');
    console.log('📊 Total de prestadores:', response.data.length);
    console.log('📊 Primeiros 3 prestadores:', response.data.slice(0, 3).map(p => ({
      id: p.id,
      nome: p.nome,
      latitude: p.latitude,
      longitude: p.longitude
    })));
    
  } catch (error) {
    console.error('❌ Erro ao buscar prestadores:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
}

async function testEndpoints() {
  console.log('🚀 Iniciando testes de API...\n');
  
  // Testar diferentes endpoints
  const endpoints = [
    '/prestadores',
    '/prestadores/mapa',
    '/prestadores/public',
    '/v1/prestadores',
    '/v1/prestadores/mapa',
    '/v1/prestadores/public'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testando endpoint: ${endpoint}`);
      const response = await axios.get(`https://api.painelsegtrack.com.br/api${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${endpoint} - Status: ${response.status}`);
      console.log(`📊 Dados recebidos: ${Array.isArray(response.data) ? response.data.length : 'N/A'} itens`);
      
    } catch (error) {
      console.log(`❌ ${endpoint} - Status: ${error.response?.status} - ${error.response?.statusText}`);
    }
  }
}

// Executar testes
async function runTests() {
  await testEndpoints();
  await testPrestadorGet();
  await testPrestadorUpdate();
}

runTests().catch(console.error); 