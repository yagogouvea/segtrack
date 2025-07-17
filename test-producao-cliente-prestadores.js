const axios = require('axios');

async function testProducaoClientePrestadores() {
  try {
    console.log('🧪 Testando endpoint em PRODUÇÃO...');
    console.log('📡 URL Base:', 'https://api.painelsegtrack.com.br');
    
    // 1. Testar se o servidor está respondendo
    console.log('\n1️⃣ Testando se o servidor está online...');
    try {
      const healthResponse = await axios.get('https://api.painelsegtrack.com.br/api/test', {
        timeout: 5000
      });
      console.log('✅ Servidor online:', healthResponse.status);
    } catch (error) {
      console.log('⚠️ Servidor não responde ao /test:', error.response?.status);
    }
    
    // 2. Testar login de cliente
    console.log('\n2️⃣ Testando login de cliente...');
    const loginResponse = await axios.post('https://api.painelsegtrack.com.br/api/auth/cliente/login', {
      cnpj: '03112879000151',
      senha: '03112879000151'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');
    console.log('🔑 Token:', token ? 'Recebido' : 'Não recebido');
    
    // 3. Testar endpoint antigo (que está falhando)
    console.log('\n3️⃣ Testando endpoint antigo (que está falhando)...');
    try {
      const oldResponse = await axios.get('https://api.painelsegtrack.com.br/api/prestadores/mapa', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('❌ Endpoint antigo funcionou (não deveria):', oldResponse.status);
    } catch (error) {
      console.log('✅ Endpoint antigo falhou como esperado:', error.response?.status);
    }
    
    // 4. Testar novo endpoint
    console.log('\n4️⃣ Testando novo endpoint de clientes...');
    const newResponse = await axios.get('https://api.painelsegtrack.com.br/api/protected/cliente/prestadores/mapa', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Novo endpoint funcionou!');
    console.log('📊 Status:', newResponse.status);
    console.log('📊 Content-Type:', newResponse.headers['content-type']);
    console.log('📊 Total de prestadores:', Array.isArray(newResponse.data) ? newResponse.data.length : 'N/A');
    
    if (Array.isArray(newResponse.data) && newResponse.data.length > 0) {
      console.log('📋 Primeiro prestador:', {
        id: newResponse.data[0].id,
        nome: newResponse.data[0].nome,
        latitude: newResponse.data[0].latitude,
        longitude: newResponse.data[0].longitude,
        modelo_antena: newResponse.data[0].modelo_antena
      });
    }
    
    // 5. Testar endpoint público como fallback
    console.log('\n5️⃣ Testando endpoint público como fallback...');
    try {
      const publicResponse = await axios.get('https://api.painelsegtrack.com.br/api/prestadores-publico', {
        timeout: 10000
      });
      console.log('✅ Endpoint público funcionou:', publicResponse.status);
      console.log('📊 Prestadores públicos:', Array.isArray(publicResponse.data) ? publicResponse.data.length : 'N/A');
    } catch (error) {
      console.log('❌ Endpoint público falhou:', error.response?.status);
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

testProducaoClientePrestadores(); 