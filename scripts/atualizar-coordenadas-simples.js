const axios = require('axios');

const API_BASE = 'http://localhost:8080/api/v1';

// Função para obter coordenadas via geocodificação
async function getCoordinates(endereco, cidade, estado) {
  try {
    // Validar se temos os dados mínimos necessários
    if (!endereco || !cidade || !estado) {
      console.log('⚠️ Dados de endereço incompletos:', { endereco, cidade, estado });
      return { latitude: null, longitude: null };
    }

    const enderecoCompleto = `${endereco}, ${cidade}, ${estado}, Brasil`;
    console.log('🔍 Geocodificando endereço:', enderecoCompleto);
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
      console.log('✅ Coordenadas encontradas:', result);
      return result;
    }
    
    console.log('⚠️ Nenhuma coordenada encontrada para:', enderecoCompleto);
    return { latitude: null, longitude: null };
  } catch (error) {
    console.error('❌ Erro ao geocodificar endereço:', error);
    return { latitude: null, longitude: null };
  }
}

async function atualizarCoordenadasPrestadores() {
  try {
    console.log('🔄 Iniciando atualização de coordenadas de prestadores...\n');
    
    // 1. Verificar se o backend está rodando
    console.log('1️⃣ Verificando se o backend está rodando...');
    try {
      const healthCheck = await axios.get(`${API_BASE}/prestadores?pageSize=1`);
      console.log('✅ Backend está funcionando!');
    } catch (error) {
      console.log('❌ Backend não está rodando na porta 8080');
      console.log('💡 Execute: npm run dev ou npm start');
      return;
    }
    
    // 2. Buscar todos os prestadores
    console.log('\n2️⃣ Buscando prestadores...');
    const response = await axios.get(`${API_BASE}/prestadores?pageSize=100`);
    
    if (!response.data.data || response.data.data.length === 0) {
      console.log('❌ Nenhum prestador encontrado');
      return;
    }

    const prestadores = response.data.data;
    console.log(`📊 Encontrados ${prestadores.length} prestadores\n`);

    // 3. Filtrar prestadores que precisam de atualização
    const prestadoresParaAtualizar = prestadores.filter(prestador => {
      const temEndereco = prestador.endereco && prestador.cidade && prestador.estado;
      const temCoordenadas = prestador.latitude && prestador.longitude && 
                             prestador.latitude !== 0 && prestador.longitude !== 0;
      
      return temEndereco && !temCoordenadas;
    });

    console.log(`🔍 ${prestadoresParaAtualizar.length} prestadores precisam de atualização de coordenadas\n`);

    if (prestadoresParaAtualizar.length === 0) {
      console.log('✅ Todos os prestadores já têm coordenadas válidas!');
      return;
    }

    let atualizados = 0;
    let comErro = 0;

    // 4. Atualizar coordenadas
    for (const prestador of prestadoresParaAtualizar) {
      console.log(`\n🔍 Processando: ${prestador.nome} (ID: ${prestador.id})`);
      console.log(`📍 Endereço: ${prestador.endereco}, ${prestador.cidade}, ${prestador.estado}`);

      // Obter novas coordenadas
      const coordinates = await getCoordinates(
        prestador.endereco,
        prestador.cidade,
        prestador.estado
      );

      if (coordinates.latitude && coordinates.longitude) {
        try {
          // Atualizar via API
          const updateData = {
            ...prestador,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          };

          await axios.put(`${API_BASE}/prestadores/${prestador.id}`, updateData);
          console.log(`✅ Coordenadas atualizadas para: ${coordinates.latitude}, ${coordinates.longitude}`);
          atualizados++;
        } catch (error) {
          console.log(`❌ Erro ao atualizar prestador: ${error.response?.data?.message || error.message}`);
          comErro++;
        }
      } else {
        console.log(`⚠️ Não foi possível obter coordenadas para este prestador`);
        comErro++;
      }

      // Aguardar um pouco entre as requisições
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n🎉 Atualização concluída!`);
    console.log(`✅ Prestadores atualizados: ${atualizados}`);
    console.log(`⚠️ Prestadores com erro: ${comErro}`);
    console.log(`📊 Total processado: ${prestadoresParaAtualizar.length}`);

  } catch (error) {
    console.error('❌ Erro durante a atualização:', error.response?.data || error.message);
  }
}

// Executar o script
atualizarCoordenadasPrestadores()
  .then(() => {
    console.log('\n✅ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no script:', error);
    process.exit(1);
  }); 