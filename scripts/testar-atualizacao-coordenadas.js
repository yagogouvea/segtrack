const axios = require('axios');

const API_BASE = 'http://localhost:8080/api/v1';

async function testarAtualizacaoCoordenadas() {
  try {
    console.log('🧪 Testando atualização de coordenadas...\n');

    // 1. Buscar um prestador existente
    console.log('1️⃣ Buscando prestadores...');
    const response = await axios.get(`${API_BASE}/prestadores?pageSize=1`);
    
    if (!response.data.data || response.data.data.length === 0) {
      console.log('❌ Nenhum prestador encontrado para teste');
      return;
    }

    const prestador = response.data.data[0];
    console.log(`✅ Prestador encontrado: ${prestador.nome} (ID: ${prestador.id})`);
    console.log(`📍 Endereço atual: ${prestador.endereco}, ${prestador.cidade}, ${prestador.estado}`);
    console.log(`📍 Coordenadas atuais: ${prestador.latitude}, ${prestador.longitude}`);

    // 2. Preparar dados de atualização (modificar endereço)
    const dadosAtualizacao = {
      ...prestador,
      endereco: 'Rua das Flores, 123', // Endereço de teste
      cidade: 'São Paulo',
      estado: 'SP'
    };

    console.log('\n2️⃣ Atualizando endereço...');
    console.log(`📍 Novo endereço: ${dadosAtualizacao.endereco}, ${dadosAtualizacao.cidade}, ${dadosAtualizacao.estado}`);

    // 3. Atualizar prestador
    const updateResponse = await axios.put(`${API_BASE}/prestadores/${prestador.id}`, dadosAtualizacao);
    
    console.log('✅ Prestador atualizado com sucesso!');
    console.log(`📍 Novas coordenadas: ${updateResponse.data.latitude}, ${updateResponse.data.longitude}`);

    // 4. Verificar se as coordenadas foram atualizadas no mapa
    console.log('\n3️⃣ Verificando dados do mapa...');
    const mapaResponse = await axios.get(`${API_BASE}/prestadores/mapa`);
    
    const prestadorNoMapa = mapaResponse.data.find(p => p.id === prestador.id);
    if (prestadorNoMapa) {
      console.log(`📍 Coordenadas no mapa: ${prestadorNoMapa.latitude}, ${prestadorNoMapa.longitude}`);
      
      if (prestadorNoMapa.latitude && prestadorNoMapa.longitude) {
        console.log('✅ Coordenadas atualizadas no mapa!');
      } else {
        console.log('⚠️ Coordenadas não foram atualizadas no mapa');
      }
    }

    console.log('\n🎉 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarAtualizacaoCoordenadas(); 