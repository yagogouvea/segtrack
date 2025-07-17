const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarCoordenadasOcorrencias() {
  try {
    console.log('🔍 Verificando coordenadas das ocorrências no banco de dados...\n');

    // Buscar todas as ocorrências com coordenadas
    const ocorrenciasComCoordenadas = await prisma.ocorrencia.findMany({
      where: {
        coordenadas: {
          not: null
        }
      },
      select: {
        id: true,
        placa1: true,
        cliente: true,
        tipo: true,
        coordenadas: true,
        endereco: true,
        bairro: true,
        cidade: true,
        estado: true,
        criado_em: true
      },
      orderBy: {
        criado_em: 'desc'
      },
      take: 10
    });

    console.log(`📊 Encontradas ${ocorrenciasComCoordenadas.length} ocorrências com coordenadas:`);
    
    if (ocorrenciasComCoordenadas.length === 0) {
      console.log('❌ Nenhuma ocorrência com coordenadas encontrada!');
      console.log('\n💡 Isso explica por que o mapa não mostra o destino das ocorrências.');
      console.log('💡 As ocorrências existentes não têm coordenadas salvas no banco.');
    } else {
      ocorrenciasComCoordenadas.forEach((ocorrencia, index) => {
        console.log(`\n${index + 1}. Ocorrência ID: ${ocorrencia.id}`);
        console.log(`   Placa: ${ocorrencia.placa1}`);
        console.log(`   Cliente: ${ocorrencia.cliente}`);
        console.log(`   Tipo: ${ocorrencia.tipo}`);
        console.log(`   Coordenadas: ${ocorrencia.coordenadas}`);
        console.log(`   Endereço: ${ocorrencia.endereco || 'N/A'}`);
        console.log(`   Bairro: ${ocorrencia.bairro || 'N/A'}`);
        console.log(`   Cidade: ${ocorrencia.cidade || 'N/A'}`);
        console.log(`   Estado: ${ocorrencia.estado || 'N/A'}`);
        console.log(`   Criada em: ${ocorrencia.criado_em}`);
      });
    }

    // Verificar total de ocorrências
    const totalOcorrencias = await prisma.ocorrencia.count();
    const ocorrenciasSemCoordenadas = await prisma.ocorrencia.count({
      where: {
        coordenadas: null
      }
    });

    console.log('\n📈 Estatísticas:');
    console.log(`   Total de ocorrências: ${totalOcorrencias}`);
    console.log(`   Com coordenadas: ${ocorrenciasComCoordenadas.length}`);
    console.log(`   Sem coordenadas: ${ocorrenciasSemCoordenadas}`);
    console.log(`   Percentual com coordenadas: ${((ocorrenciasComCoordenadas.length / totalOcorrencias) * 100).toFixed(1)}%`);

    // Verificar formato das coordenadas
    if (ocorrenciasComCoordenadas.length > 0) {
      console.log('\n🔍 Análise do formato das coordenadas:');
      ocorrenciasComCoordenadas.forEach((ocorrencia, index) => {
        const coords = ocorrencia.coordenadas;
        if (coords) {
          const parts = coords.split(',').map(p => p.trim());
          console.log(`   ${index + 1}. "${coords}" -> ${parts.length} partes: [${parts.join(', ')}]`);
          
          if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            console.log(`      Latitude: ${lat} (${isNaN(lat) ? 'INVÁLIDA' : 'OK'})`);
            console.log(`      Longitude: ${lng} (${isNaN(lng) ? 'INVÁLIDA' : 'OK'})`);
          } else {
            console.log(`      ❌ Formato inválido: esperado "lat,lng", encontrado ${parts.length} partes`);
          }
        }
      });
    }

    // Verificar ocorrências recentes sem coordenadas
    const ocorrenciasRecentesSemCoordenadas = await prisma.ocorrencia.findMany({
      where: {
        coordenadas: null,
        criado_em: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
        }
      },
      select: {
        id: true,
        placa1: true,
        cliente: true,
        tipo: true,
        criado_em: true
      },
      orderBy: {
        criado_em: 'desc'
      },
      take: 5
    });

    if (ocorrenciasRecentesSemCoordenadas.length > 0) {
      console.log('\n⚠️  Ocorrências recentes (últimos 7 dias) sem coordenadas:');
      ocorrenciasRecentesSemCoordenadas.forEach((ocorrencia, index) => {
        console.log(`   ${index + 1}. ID: ${ocorrencia.id}, Placa: ${ocorrencia.placa1}, Cliente: ${ocorrencia.cliente}, Criada: ${ocorrencia.criado_em}`);
      });
    }

    console.log('\n💡 Recomendações:');
    console.log('   1. Verificar se o AdicionarOcorrenciaPopup está enviando coordenadas corretamente');
    console.log('   2. Verificar se o backend está salvando as coordenadas no banco');
    console.log('   3. Criar ocorrências de teste com coordenadas válidas');
    console.log('   4. Atualizar ocorrências existentes com coordenadas se necessário');

  } catch (error) {
    console.error('❌ Erro ao verificar coordenadas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a verificação
verificarCoordenadasOcorrencias(); 