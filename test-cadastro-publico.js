const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'https://api.painelsegtrack.com.br/api';

async function testCadastroPublico() {
  try {
    console.log('🔍 Testando cadastro público de prestadores...');
    
    // Dados de teste baseados no payload que está falhando
    const testData = {
      nome: "Yago Gouvea",
      cpf: "39623056885",
      cod_nome: "manoel",
      telefone: "(11) 94729-3221",
      email: "yago@segtrackpr.com.br",
      tipo_pix: "cpf",
      chave_pix: "39623056885",
      cep: "03502000",
      endereco: "Rua Doutor Suzano Brandão",
      bairro: "Vila Aricanduva",
      cidade: "São Paulo",
      estado: "SP",
      funcoes: [
        {
          "funcao": "Pronta resposta"
        },
        {
          "funcao": "Apoio armado"
        },
        {
          "funcao": "Policial"
        }
      ],
      regioes: [
        {
          "regiao": "Vila Aricanduva, Vila Matilde, São Paulo, Região Imediata de São Paulo, Região Metropolitana de São Paulo, São Paulo, Região Sudeste, 03507-000, Brasil"
        }
      ],
      modelo_antena: "",
      veiculos: [
        {
          "tipo": "Carro"
        }
      ]
    };
    
    console.log('📦 Dados de teste:', JSON.stringify(testData, null, 2));
    
    // Testar cadastro público
    const response = await axios.post(`${API_BASE_URL}/prestadores-publico`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Cadastro público bem-sucedido!');
    console.log('📊 Resposta:', {
      id: response.data.id,
      nome: response.data.nome,
      funcoes: response.data.funcoes?.length,
      regioes: response.data.regioes?.length,
      veiculos: response.data.veiculos?.length
    });
    
  } catch (error) {
    console.error('❌ Erro no cadastro público:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Se for erro 400, analisar os detalhes
    if (error.response?.status === 400) {
      console.log('\n🔍 Análise do erro 400:');
      console.log('Detalhes:', error.response.data);
      
      if (error.response.data?.missingFields) {
        console.log('Campos faltando:', error.response.data.missingFields);
      }
      
      if (error.response.data?.details) {
        console.log('Detalhes da validação:', error.response.data.details);
      }
    }
  }
}

async function testEndpoint() {
  try {
    console.log('\n🔍 Testando endpoint de teste...');
    
    const response = await axios.get(`${API_BASE_URL}/prestadores-publico/test`);
    
    console.log('✅ Endpoint funcionando:', response.data);
    
  } catch (error) {
    console.error('❌ Erro no endpoint de teste:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

async function testValidation() {
  console.log('\n🔍 Testando validações específicas...');
  
  // Teste 1: Dados válidos
  const validData = {
    nome: "Teste Valido",
    cpf: "12345678901",
    cod_nome: "teste",
    telefone: "(11) 99999-9999",
    email: "teste@teste.com",
    tipo_pix: "cpf",
    chave_pix: "12345678901",
    cep: "12345678",
    endereco: "Rua Teste",
    bairro: "Bairro Teste",
    cidade: "São Paulo",
    estado: "SP",
    funcoes: ["Pronta resposta"],
    regioes: ["São Paulo"],
    tipo_veiculo: ["Carro"],
    modelo_antena: ""
  };
  
  try {
    console.log('📦 Testando dados válidos...');
    const response = await axios.post(`${API_BASE_URL}/prestadores-publico`, validData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Dados válidos aceitos:', response.status);
    
  } catch (error) {
    console.error('❌ Erro com dados válidos:', {
      status: error.response?.status,
      data: error.response?.data
    });
  }
  
  // Teste 2: Dados inválidos (para ver as validações)
  const invalidData = {
    nome: "T", // Nome muito curto
    cpf: "123", // CPF inválido
    cod_nome: "t", // Codinome muito curto
    telefone: "123", // Telefone inválido
    email: "email-invalido", // Email inválido
    tipo_pix: "invalido", // Tipo PIX inválido
    chave_pix: "123", // Chave PIX inválida
    cep: "123", // CEP inválido
    endereco: "", // Endereço vazio
    bairro: "", // Bairro vazio
    cidade: "", // Cidade vazia
    estado: "SPP", // Estado inválido
    funcoes: [], // Array vazio
    regioes: [], // Array vazio
    tipo_veiculo: [], // Array vazio
    modelo_antena: ""
  };
  
  try {
    console.log('\n📦 Testando dados inválidos...');
    const response = await axios.post(`${API_BASE_URL}/prestadores-publico`, invalidData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('⚠️ Dados inválidos foram aceitos (não deveria):', response.status);
    
  } catch (error) {
    console.log('✅ Validação funcionando (esperado):', {
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

async function runTests() {
  await testEndpoint();
  await testValidation();
  await testCadastroPublico();
}

runTests().catch(console.error); 