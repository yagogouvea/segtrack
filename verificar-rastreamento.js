const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarRastreamento() {
  try {
    console.log('🔍 Verificando rastreamento no banco de dados...');
    
    // Buscar todas as posições do prestador Yago (ID 133)
    const rastreamentos = await prisma.rastreamentoPrestador.findMany({
      where: {
        prestador_id: 133
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10
    });
    
    console.log(`✅ Encontradas ${rastreamentos.length} posições recentes:`);
    
    rastreamentos.forEach((rastreamento, index) => {
      console.log(`${index + 1}. ID: ${rastreamento.id}`);
      console.log(`   Prestador ID: ${rastreamento.prestador_id}`);
      console.log(`   Ocorrência ID: ${rastreamento.ocorrencia_id || 'N/A'}`);
      console.log(`   Latitude: ${rastreamento.latitude}`);
      console.log(`   Longitude: ${rastreamento.longitude}`);
      console.log(`   Precisão: ${rastreamento.precisao || 'N/A'}m`);
      console.log(`   Velocidade: ${rastreamento.velocidade || 'N/A'} km/h`);
      console.log(`   Status: ${rastreamento.status}`);
      console.log(`   Timestamp: ${rastreamento.timestamp.toLocaleString('pt-BR')}`);
      console.log('   ---');
    });
    
    // Verificar estatísticas
    const totalPosicoes = await prisma.rastreamentoPrestador.count({
      where: {
        prestador_id: 133
      }
    });
    
    console.log(`📊 Total de posições do prestador: ${totalPosicoes}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar rastreamento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarRastreamento(); 