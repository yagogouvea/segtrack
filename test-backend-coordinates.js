const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

async function testBackendCoordinates() {
  try {
    console.log('🧪 Testando backend e coordenadas...\n');

    // 1. Testar se o backend está rodando
    console.log('1️⃣ Testando conexão com o backend...');
    const healthResponse = await axios.get(`${API_BASE}/prestadores-publico/test`);
    console.log('✅ Backend está funcionando!');

    // 2. Testar rota pública de prestadores
    console.log('\n2️⃣ Testando rota pública de prestadores...');
    try {
      const prestadoresResponse = await axios.get(`${API_BASE}/prestadores-publico`);
      console.log(`✅ Rota pública funcionando! ${prestadoresResponse.data.length} prestadores públicos`);
    } catch (error) {
      console.log('⚠️ Rota pública não disponível');
    }

    // 3. Testar rota protegida (pode falhar sem token)
    console.log('\n3️⃣ Testando rota protegida de prestadores...');
    try {
      const prestadoresResponse = await axios.get(`${API_BASE}/prestadores?pageSize=1`);
      if (prestadoresResponse.data.data && prestadoresResponse.data.data.length > 0) {
        const prestador = prestadoresResponse.data.data[0];
        console.log(`✅ Prestador encontrado: ${prestador.nome}`);
        console.log(`📍 Endereço: ${prestador.endereco}, ${prestador.cidade}, ${prestador.estado}`);
        console.log(`📍 Coordenadas: ${prestador.latitude}, ${prestador.longitude}`);

        // 4. Testar endpoint do mapa
        console.log('\n4️⃣ Testando endpoint do mapa...');
        const mapaResponse = await axios.get(`${API_BASE}/prestadores/mapa`);
        console.log(`✅ Endpoint do mapa funcionando! ${mapaResponse.data.length} prestadores no mapa`);

        // 5. Verificar se o prestador está no mapa
        const prestadorNoMapa = mapaResponse.data.find(p => p.id === prestador.id);
        if (prestadorNoMapa) {
          console.log(`📍 Prestador no mapa: ${prestadorNoMapa.latitude}, ${prestadorNoMapa.longitude}`);
          
          if (prestadorNoMapa.latitude && prestadorNoMapa.longitude) {
            console.log('✅ Coordenadas válidas no mapa!');
          } else {
            console.log('⚠️ Prestador sem coordenadas no mapa');
          }
        }
      } else {
        console.log('⚠️ Nenhum prestador encontrado para teste');
      }
    } catch (error) {
      console.log('❌ Rota protegida requer autenticação');
      console.log('💡 Para usar os scripts, você precisa fazer login primeiro');
    }

    console.log('\n🎉 Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Certifique-se de que o backend está rodando na porta 8080');
      console.log('   Execute: npm run dev ou npm start');
    }
  }
}

testBackendCoordinates(); 