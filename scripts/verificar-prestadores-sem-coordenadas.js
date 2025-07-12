const axios = require('axios');

const API_BASE = 'http://localhost:8080/api/v1';

async function verificarPrestadoresSemCoordenadas() {
  try {
    console.log('🔍 Verificando prestadores sem coordenadas...\n');

    // Buscar todos os prestadores
    const response = await axios.get(`${API_BASE}/prestadores?pageSize=100`);
    
    if (!response.data.data || response.data.data.length === 0) {
      console.log('❌ Nenhum prestador encontrado');
      return;
    }

    const prestadores = response.data.data;
    console.log(`📊 Total de prestadores: ${prestadores.length}\n`);

    // Categorizar prestadores
    const semCoordenadas = [];
    const comCoordenadas = [];
    const comEnderecoIncompleto = [];

    prestadores.forEach(prestador => {
      const temEndereco = prestador.endereco && prestador.cidade && prestador.estado;
      const temCoordenadas = prestador.latitude && prestador.longitude && 
                             prestador.latitude !== 0 && prestador.longitude !== 0;

      if (!temEndereco) {
        comEnderecoIncompleto.push(prestador);
      } else if (!temCoordenadas) {
        semCoordenadas.push(prestador);
      } else {
        comCoordenadas.push(prestador);
      }
    });

    // Exibir resultados
    console.log('📋 RESUMO:');
    console.log(`✅ Com coordenadas válidas: ${comCoordenadas.length}`);
    console.log(`⚠️ Sem coordenadas: ${semCoordenadas.length}`);
    console.log(`❌ Endereço incompleto: ${comEnderecoIncompleto.length}\n`);

    if (semCoordenadas.length > 0) {
      console.log('🔍 PRESTADORES SEM COORDENADAS:');
      semCoordenadas.forEach(prestador => {
        console.log(`- ${prestador.nome} (ID: ${prestador.id})`);
        console.log(`  📍 Endereço: ${prestador.endereco}, ${prestador.cidade}, ${prestador.estado}`);
        console.log(`  📍 Coordenadas: ${prestador.latitude}, ${prestador.longitude}`);
        console.log('');
      });
    }

    if (comEnderecoIncompleto.length > 0) {
      console.log('❌ PRESTADORES COM ENDEREÇO INCOMPLETO:');
      comEnderecoIncompleto.forEach(prestador => {
        console.log(`- ${prestador.nome} (ID: ${prestador.id})`);
        console.log(`  📍 Endereço: ${prestador.endereco || 'N/A'}, ${prestador.cidade || 'N/A'}, ${prestador.estado || 'N/A'}`);
        console.log('');
      });
    }

    // Calcular porcentagem
    const totalComEndereco = comCoordenadas.length + semCoordenadas.length;
    const porcentagemComCoordenadas = totalComEndereco > 0 ? 
      ((comCoordenadas.length / totalComEndereco) * 100).toFixed(1) : 0;

    console.log(`📊 ESTATÍSTICAS:`);
    console.log(`- ${porcentagemComCoordenadas}% dos prestadores com endereço completo têm coordenadas`);
    console.log(`- ${semCoordenadas.length} prestadores precisam de atualização de coordenadas`);

    if (semCoordenadas.length > 0) {
      console.log('\n💡 SUGESTÃO: Execute o script de atualização de coordenadas para corrigir automaticamente.');
    }

  } catch (error) {
    console.error('❌ Erro na verificação:', error.response?.data || error.message);
  }
}

verificarPrestadoresSemCoordenadas(); 