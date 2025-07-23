const axios = require('axios');

async function testarCNPJProducao() {
  const cnpjs = [
    '55565869000175',
    '21920358000102'
  ];

  console.log('🧪 Testando API de CNPJ em PRODUÇÃO...');
  console.log('📡 URL Base:', 'https://api.painelsegtrack.com.br');

  for (const cnpj of cnpjs) {
    console.log(`\n🔍 Testando CNPJ: ${cnpj}`);
    
    try {
      const response = await axios.get(`https://api.painelsegtrack.com.br/api/cnpj/${cnpj}`, {
        timeout: 30000,
        headers: {
          'User-Agent': 'SegTrack-Test/1.0'
        }
      });
      
      console.log('✅ Sucesso!');
      console.log('📊 Status:', response.status);
      console.log('📋 Dados:', {
        company: response.data.company?.name,
        fantasy: response.data.company?.fantasy_name,
        city: response.data.address?.city,
        state: response.data.address?.state
      });
      
    } catch (error) {
      console.error('❌ Erro:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.error || error.message,
        code: error.code
      });
    }
  }

  console.log('\n🔍 Testando BrasilAPI diretamente...');
  
  try {
    const response = await axios.get('https://brasilapi.com.br/api/cnpj/v1/55565869000175', {
      timeout: 15000
    });
    
    console.log('✅ BrasilAPI funcionando!');
    console.log('📊 Status:', response.status);
    console.log('📋 Dados recebidos:', {
      razao_social: response.data.razao_social,
      municipio: response.data.municipio,
      uf: response.data.uf
    });
    
  } catch (error) {
    console.error('❌ BrasilAPI com erro:', {
      status: error.response?.status,
      message: error.response?.data || error.message
    });
  }
}

testarCNPJProducao().catch(console.error); 