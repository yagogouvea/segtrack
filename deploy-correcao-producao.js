const axios = require('axios');

const PRODUCAO_URL = 'https://api.painelsegtrack.com.br/api';
const TEST_CREDENTIALS = {
  email: 'alain.ag.souza@gmail.com',
  senha: '38355220862'
};

async function verificarEaplicarCorrecao() {
  console.log('🚀 VERIFICAÇÃO E APLICAÇÃO DA CORREÇÃO EM PRODUÇÃO');
  console.log('='.repeat(60));

  try {
    // 1. Teste inicial - verificar se a correção já foi aplicada
    console.log('1️⃣ Teste inicial - verificando se a correção foi aplicada...');
    
    const loginResponse = await axios.post(`${PRODUCAO_URL}/prestador/login`, TEST_CREDENTIALS, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const authToken = loginResponse.data.token;
    const prestador = loginResponse.data.usuario;
    
    console.log(`✅ Login realizado: ${prestador.nome}`);

    // Testar endpoint de ocorrências
    const ocorrenciasResponse = await axios.get(`${PRODUCAO_URL}/protected-prestador/prestador/ocorrencias`, {
      timeout: 15000,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const ocorrencias = ocorrenciasResponse.data.ocorrencias;
    const ocorrencia111 = ocorrencias.find(oc => oc.id === 111);

    if (ocorrencia111) {
      console.log('❌ PROBLEMA: Ocorrência 111 ainda está sendo retornada!');
      console.log(`   Prestador na ocorrência 111: "${ocorrencia111.prestador}"`);
      console.log(`   Prestador logado: "${prestador.nome}"`);
      console.log('   🔧 A correção precisa ser aplicada em produção');
      
      console.log('\n📋 INSTRUÇÕES PARA APLICAR A CORREÇÃO:');
      console.log('1. Acesse o servidor de produção');
      console.log('2. Navegue até a pasta do backend');
      console.log('3. Execute os comandos:');
      console.log('   npm run build');
      console.log('   pm2 restart segtrack-backend');
      console.log('4. Aguarde alguns segundos');
      console.log('5. Execute este script novamente para verificar');
      
    } else {
      console.log('✅ SUCESSO: Ocorrência 111 não foi retornada!');
      console.log('   A correção já foi aplicada em produção');
      console.log(`   Total de ocorrências retornadas: ${ocorrencias.length}`);
      
      // Verificar se todas as ocorrências pertencem ao prestador
      const ocorrenciasIncorretas = ocorrencias.filter(oc => oc.prestador !== prestador.nome);
      if (ocorrenciasIncorretas.length === 0) {
        console.log('✅ TODAS as ocorrências pertencem ao prestador logado!');
      } else {
        console.log(`⚠️  ${ocorrenciasIncorretas.length} ocorrências não pertencem ao prestador`);
        ocorrenciasIncorretas.forEach(oc => {
          console.log(`   - ID: ${oc.id}, Prestador: "${oc.prestador}"`);
        });
      }
    }

    console.log('\n📊 Resumo do teste:');
    console.log(`   - Prestador: ${prestador.nome}`);
    console.log(`   - Ocorrências retornadas: ${ocorrencias.length}`);
    console.log(`   - Ocorrência 111 encontrada: ${ocorrencia111 ? 'SIM ❌' : 'NÃO ✅'}`);

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Executar o script
verificarEaplicarCorrecao(); 