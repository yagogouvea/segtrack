const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMissingCoordinates() {
  try {
    console.log('🔍 Verificando prestadores sem coordenadas...\n');

    // Buscar prestadores sem latitude/longitude
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
        bairro: true,
        cidade: true,
        estado: true,
        cep: true,
        latitude: true,
        longitude: true,
        criado_em: true,
        funcoes: {
          select: {
            funcao: true
          }
        },
        regioes: {
          select: {
            regiao: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    });

    console.log(`📊 Total de prestadores sem coordenadas: ${prestadoresSemCoordenadas.length}\n`);

    if (prestadoresSemCoordenadas.length === 0) {
      console.log('✅ Todos os prestadores têm coordenadas!');
      return;
    }

    console.log('📋 Detalhes dos prestadores sem coordenadas:\n');

    for (const prestador of prestadoresSemCoordenadas) {
      console.log(`🆔 ID: ${prestador.id}`);
      console.log(`👤 Nome: ${prestador.nome}`);
      console.log(`📍 Endereço: ${prestador.endereco || 'N/A'}`);
      console.log(`🏘️ Bairro: ${prestador.bairro || 'N/A'}`);
      console.log(`🏙️ Cidade: ${prestador.cidade || 'N/A'}`);
      console.log(`🌍 Estado: ${prestador.estado || 'N/A'}`);
      console.log(`📮 CEP: ${prestador.cep || 'N/A'}`);
      console.log(`📅 Criado em: ${prestador.criado_em}`);
      console.log(`🎯 Funções: ${prestador.funcoes.map(f => f.funcao).join(', ') || 'N/A'}`);
      console.log(`🗺️ Regiões: ${prestador.regioes.map(r => r.regiao).join(', ') || 'N/A'}`);
      console.log(`📍 Coordenadas atuais: Lat=${prestador.latitude}, Lng=${prestador.longitude}`);
      
      // Verificar se tem endereço suficiente para geocodificação
      const enderecoCompleto = [prestador.endereco, prestador.cidade, prestador.estado].filter(Boolean).join(', ');
      if (enderecoCompleto) {
        console.log(`🔍 Endereço para geocodificação: ${enderecoCompleto}`);
      } else {
        console.log(`❌ Endereço incompleto - não é possível geocodificar`);
      }
      
      console.log('─'.repeat(50));
    }

    // Estatísticas
    const totalPrestadores = await prisma.prestador.count();
    const prestadoresComCoordenadas = await prisma.prestador.count({
      where: {
        AND: [
          { latitude: { not: null } },
          { longitude: { not: null } },
          { latitude: { not: 0 } },
          { longitude: { not: 0 } }
        ]
      }
    });

    console.log('\n📈 Estatísticas:');
    console.log(`📊 Total de prestadores: ${totalPrestadores}`);
    console.log(`✅ Com coordenadas: ${prestadoresComCoordenadas}`);
    console.log(`❌ Sem coordenadas: ${prestadoresSemCoordenadas.length}`);
    console.log(`📊 Percentual com coordenadas: ${((prestadoresComCoordenadas / totalPrestadores) * 100).toFixed(1)}%`);

    // Análise por função
    console.log('\n🎯 Análise por função:');
    const funcoesSemCoordenadas = {};
    for (const prestador of prestadoresSemCoordenadas) {
      for (const funcao of prestador.funcoes) {
        if (!funcoesSemCoordenadas[funcao.funcao]) {
          funcoesSemCoordenadas[funcao.funcao] = 0;
        }
        funcoesSemCoordenadas[funcao.funcao]++;
      }
    }

    for (const [funcao, count] of Object.entries(funcoesSemCoordenadas)) {
      console.log(`  ${funcao}: ${count} prestadores`);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar coordenadas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
checkMissingCoordinates(); 