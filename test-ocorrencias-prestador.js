const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api';
const TEST_CREDENTIALS = {
  email: 'alain.ag.souza@gmail.com',
  senha: '38355220862'
};

async function testOcorrenciasPrestador() {
  console.log('🔍 TESTE DE OCORRÊNCIAS DO PRESTADOR');
  console.log('='.repeat(50));

  let authToken = null;

  try {
    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/prestador/login`, TEST_CREDENTIALS, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    authToken = loginResponse.data.token;
    const prestador = loginResponse.data.usuario;
    
    console.log('✅ Login realizado com sucesso');
    console.log(`   Prestador: ${prestador.nome}`);
    console.log(`   ID: ${prestador.id}`);
    console.log(`   Token: ${authToken ? 'Sim' : 'Não'}`);

    // 2. Testar endpoint de ocorrências
    console.log('\n2️⃣ Testando endpoint de ocorrências...');
    const ocorrenciasResponse = await axios.get(`${BASE_URL}/protected-prestador/prestador/ocorrencias`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Ocorrências carregadas com sucesso');
    console.log(`   Total de ocorrências: ${ocorrenciasResponse.data.ocorrencias.length}`);
    console.log(`   Prestador retornado: ${ocorrenciasResponse.data.prestador?.nome}`);

    // 3. Verificar se as ocorrências pertencem ao prestador
    const ocorrencias = ocorrenciasResponse.data.ocorrencias;
    if (ocorrencias.length > 0) {
      console.log('\n📋 Detalhes das ocorrências:');
      ocorrencias.forEach((oc, index) => {
        console.log(`   ${index + 1}. ID: ${oc.id}, Status: ${oc.status}, Prestador: "${oc.prestador}"`);
        
        // Verificar se a ocorrência pertence ao prestador logado
        if (oc.prestador !== prestador.nome) {
          console.log(`   ⚠️  ATENÇÃO: Ocorrência ${oc.id} não pertence ao prestador logado!`);
          console.log(`      Prestador na ocorrência: "${oc.prestador}"`);
          console.log(`      Prestador logado: "${prestador.nome}"`);
        } else {
          console.log(`   ✅ Ocorrência ${oc.id} pertence ao prestador logado`);
        }
      });
    } else {
      console.log('ℹ️  Nenhuma ocorrência encontrada para o prestador');
    }

    // 4. Testar endpoint de ocorrências finalizadas
    console.log('\n3️⃣ Testando endpoint de ocorrências finalizadas...');
    const finalizadasResponse = await axios.get(`${BASE_URL}/protected-prestador/prestador/ocorrencias-finalizadas`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Ocorrências finalizadas carregadas com sucesso');
    console.log(`   Total de ocorrências finalizadas: ${finalizadasResponse.data.length}`);

    // 5. Verificar se as ocorrências finalizadas pertencem ao prestador
    const ocorrenciasFinalizadas = finalizadasResponse.data;
    if (ocorrenciasFinalizadas.length > 0) {
      console.log('\n📋 Detalhes das ocorrências finalizadas:');
      ocorrenciasFinalizadas.forEach((oc, index) => {
        console.log(`   ${index + 1}. ID: ${oc.id}, Status: ${oc.status}, Prestador: "${oc.prestador}"`);
        
        // Verificar se a ocorrência pertence ao prestador logado
        if (oc.prestador !== prestador.nome) {
          console.log(`   ⚠️  ATENÇÃO: Ocorrência finalizada ${oc.id} não pertence ao prestador logado!`);
          console.log(`      Prestador na ocorrência: "${oc.prestador}"`);
          console.log(`      Prestador logado: "${prestador.nome}"`);
        } else {
          console.log(`   ✅ Ocorrência finalizada ${oc.id} pertence ao prestador logado`);
        }
      });
    } else {
      console.log('ℹ️  Nenhuma ocorrência finalizada encontrada para o prestador');
    }

    console.log('\n✅ Teste concluído com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - Ocorrências ativas: ${ocorrencias.length}`);
    console.log(`   - Ocorrências finalizadas: ${ocorrenciasFinalizadas.length}`);
    console.log(`   - Prestador: ${prestador.nome}`);

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Executar o teste
testOcorrenciasPrestador(); 