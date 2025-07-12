const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Função para obter coordenadas com diferentes estratégias
async function getCoordinatesAdvanced(endereco, cidade, estado) {
  const estrategias = [
    // Estratégia 1: Endereço completo
    `${endereco}, ${cidade}, ${estado}, Brasil`,
    // Estratégia 2: Apenas cidade e estado
    `${cidade}, ${estado}, Brasil`,
    // Estratégia 3: Endereço + cidade
    `${endereco}, ${cidade}, Brasil`,
    // Estratégia 4: Apenas cidade
    `${cidade}, Brasil`
  ];

  for (let i = 0; i < estrategias.length; i++) {
    const enderecoTeste = estrategias[i];
    console.log(`🔍 Tentativa ${i + 1}: ${enderecoTeste}`);
    
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTeste)}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        console.log(`✅ Coordenadas encontradas (estratégia ${i + 1}): ${lat}, ${lon}`);
        return { latitude: lat, longitude: lon };
      }
      
      // Aguardar entre tentativas
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`❌ Erro na estratégia ${i + 1}: ${error.message}`);
    }
  }
  
  console.log(`❌ Nenhuma estratégia funcionou para: ${endereco}, ${cidade}, ${estado}`);
  return { latitude: null, longitude: null };
}

async function fixRemainingCoordinates() {
  try {
    console.log('🔧 Corrigindo coordenadas restantes...\n');

    // Buscar prestadores sem coordenadas
    const prestadoresSemCoordenadas = await prisma.prestador.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
          { latitude: 0 },
          { longitude: 0 }
        ]
      },
      select: {
        id: true,
        nome: true,
        endereco: true,
        cidade: true,
        estado: true,
        latitude: true,
        longitude: true
      },
      orderBy: {
        nome: 'asc'
      }
    });

    console.log(`📊 Encontrados ${prestadoresSemCoordenadas.length} prestadores restantes\n`);

    if (prestadoresSemCoordenadas.length === 0) {
      console.log('✅ Todos os prestadores já têm coordenadas!');
      return;
    }

    let sucessos = 0;
    let falhas = 0;
    const falhasDetalhadas = [];

    for (const prestador of prestadoresSemCoordenadas) {
      console.log(`\n🔄 Processando: ${prestador.nome}`);
      console.log(`📍 Endereço: ${prestador.endereco || 'N/A'}`);
      console.log(`🏙️ Cidade: ${prestador.cidade || 'N/A'}`);
      console.log(`🌍 Estado: ${prestador.estado || 'N/A'}`);
      
      // Verificar se tem pelo menos cidade e estado
      if (!prestador.cidade || !prestador.estado) {
        console.log(`❌ Dados insuficientes para ${prestador.nome}`);
        falhas++;
        falhasDetalhadas.push({
          id: prestador.id,
          nome: prestador.nome,
          motivo: 'Dados insuficientes (falta cidade ou estado)',
          endereco: `${prestador.endereco || 'N/A'}, ${prestador.cidade || 'N/A'}, ${prestador.estado || 'N/A'}`
        });
        continue;
      }

      // Aguardar entre prestadores
      await new Promise(resolve => setTimeout(resolve, 1000));

      const coordinates = await getCoordinatesAdvanced(
        prestador.endereco || prestador.cidade, 
        prestador.cidade, 
        prestador.estado
      );

      if (coordinates.latitude && coordinates.longitude) {
        try {
          await prisma.prestador.update({
            where: { id: prestador.id },
            data: {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude
            }
          });
          console.log(`✅ Coordenadas atualizadas para ${prestador.nome}`);
          sucessos++;
        } catch (error) {
          console.error(`❌ Erro ao salvar coordenadas para ${prestador.nome}:`, error.message);
          falhas++;
          falhasDetalhadas.push({
            id: prestador.id,
            nome: prestador.nome,
            motivo: 'Erro ao salvar no banco',
            endereco: `${prestador.endereco || 'N/A'}, ${prestador.cidade}, ${prestador.estado}`
          });
        }
      } else {
        console.log(`❌ Não foi possível obter coordenadas para ${prestador.nome}`);
        falhas++;
        falhasDetalhadas.push({
          id: prestador.id,
          nome: prestador.nome,
          motivo: 'Todas as estratégias falharam',
          endereco: `${prestador.endereco || 'N/A'}, ${prestador.cidade}, ${prestador.estado}`
        });
      }
    }

    // Relatório final
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Falhas: ${falhas}`);
    console.log(`📊 Taxa de sucesso: ${((sucessos / prestadoresSemCoordenadas.length) * 100).toFixed(1)}%`);

    if (falhasDetalhadas.length > 0) {
      console.log('\n❌ DETALHES DAS FALHAS:');
      falhasDetalhadas.forEach(falha => {
        console.log(`  - ${falha.nome} (ID: ${falha.id}): ${falha.motivo}`);
        console.log(`    Endereço: ${falha.endereco}`);
      });
    }

    // Verificar resultado final
    const totalComCoordenadas = await prisma.prestador.count({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } },
          { latitude: { not: 0 } },
          { longitude: { not: 0 } }
        ]
      }
    });

    const totalPrestadores = await prisma.prestador.count();
    console.log(`\n📈 SITUAÇÃO FINAL:`);
    console.log(`📊 Total de prestadores: ${totalPrestadores}`);
    console.log(`✅ Com coordenadas: ${totalComCoordenadas}`);
    console.log(`❌ Sem coordenadas: ${totalPrestadores - totalComCoordenadas}`);
    console.log(`📊 Percentual com coordenadas: ${((totalComCoordenadas / totalPrestadores) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
fixRemainingCoordinates(); 