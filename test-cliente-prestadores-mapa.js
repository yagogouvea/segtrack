const axios = require('axios');

async function testClientePrestadoresMapa() {
  try {
    console.log('🧪 Testando endpoint /api/protected/cliente/prestadores/mapa...');
    
    // Primeiro, fazer login como cliente
    console.log('📡 Fazendo login como cliente...');
    const loginResponse = await axios.post('https://api.painelsegtrack.com.br/api/auth/cliente/login', {
      cnpj: '03112879000151',
      senha: '03112879000151'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login como cliente realizado');
    console.log('🔑 Token recebido:', token ? 'Sim' : 'Não');
    
    // Testar o endpoint de prestadores para clientes
    console.log('\n📡 Testando endpoint de prestadores para clientes...');
    const prestadoresResponse = await axios.get('https://api.painelsegtrack.com.br/api/protected/cliente/prestadores/mapa', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Endpoint funcionou!');
    console.log('📊 Status:', prestadoresResponse.status);
    console.log('📊 Content-Type:', prestadoresResponse.headers['content-type']);
    console.log('📊 Total de prestadores:', Array.isArray(prestadoresResponse.data) ? prestadoresResponse.data.length : 'N/A');
    
    if (Array.isArray(prestadoresResponse.data) && prestadoresResponse.data.length > 0) {
      console.log('📋 Primeiro prestador:', {
        id: prestadoresResponse.data[0].id,
        nome: prestadoresResponse.data[0].nome,
        latitude: prestadoresResponse.data[0].latitude,
        longitude: prestadoresResponse.data[0].longitude,
        modelo_antena: prestadoresResponse.data[0].modelo_antena
      });
      
      // Verificar se há antenistas
      const antenistas = prestadoresResponse.data.filter(p => 
        p.funcoes && p.funcoes.some(f => f.funcao.toLowerCase().includes('antenista'))
      );
      console.log('📡 Antenistas encontrados:', antenistas.length);
      
      if (antenistas.length > 0) {
        console.log('📡 Primeiro antenista:', {
          nome: antenistas[0].nome,
          modelo_antena: antenistas[0].modelo_antena,
          funcoes: antenistas[0].funcoes.map(f => f.funcao)
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro detalhado:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
  }
}

testClientePrestadoresMapa(); 