const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'https://api.painelsegtrack.com.br/api/v1';
const PRESTADOR_ID = 26;

// Token de autenticação (substitua pelo token válido)
const TOKEN = process.env.TEST_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

async function testUpdateFix() {
  try {
    console.log('🔍 Testando correção do erro 500 na atualização...');
    
    // Dados de teste que simulam o que o frontend envia
    const testData = {
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
      // Arrays de strings (como o frontend envia)
      funcoes: ['Segurança', 'Apoio armado'],
      regioes: ['Brasília', 'DF'],
      tipo_veiculo: ['Carro'],
      // Valores como strings (como o frontend pode enviar)
      valor_acionamento: '50.00',
      valor_hora_adc: '30.00',
      valor_km_adc: '2.00',
      franquia_km: '50',
      franquia_horas: '2',
      aprovado: 'true'
    };
    
    console.log('📦 Dados de teste (formato frontend):', JSON.stringify(testData, null, 2));
    
    // Tentar atualizar
    const response = await axios.put(`${API_BASE_URL}/prestadores/${PRESTADOR_ID}`, testData, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Atualização bem-sucedida!');
    console.log('📊 Resposta:', {
      id: response.data.id,
      nome: response.data.nome,
      funcoes: response.data.funcoes?.length,
      regioes: response.data.regioes?.length,
      veiculos: response.data.veiculos?.length
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
  }
}

async function testGetPrestador() {
  try {
    console.log('\n🔍 Testando busca do prestador...');
    
    const response = await axios.get(`${API_BASE_URL}/prestadores/${PRESTADOR_ID}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Prestador encontrado:', {
      id: response.data.id,
      nome: response.data.nome,
      funcoes: response.data.funcoes?.length,
      regioes: response.data.regioes?.length,
      veiculos: response.data.veiculos?.length
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar prestador:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

async function runTests() {
  await testGetPrestador();
  await testUpdateFix();
}

runTests().catch(console.error); 