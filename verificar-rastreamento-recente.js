const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Função para converter timestamp para fuso brasileiro
function formatBrazilianTime(date) {
  return new Date(date).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

async function verificarRastreamentoRecente() {
  try {
    console.log('🔍 Verificando rastreamento recente...');
    
    // Buscar posições dos últimos 5 minutos
    const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000);
    
    const rastreamentos = await prisma.rastreamentoPrestador.findMany({
      where: {
        prestador_id: 133,
        timestamp: {
          gte: cincoMinutosAtras
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });
    
    console.log(`✅ Encontradas ${rastreamentos.length} posições nos últimos 5 minutos:`);
    
    if (rastreamentos.length > 0) {
      // Calcular intervalos entre posições
      const intervalos = [];
      for (let i = 0; i < rastreamentos.length - 1; i++) {
        const diff = rastreamentos[i].timestamp - rastreamentos[i + 1].timestamp;
        const segundos = Math.round(diff / 1000);
        intervalos.push(segundos);
      }
      
      console.log('📊 Intervalos entre posições (em segundos):', intervalos);
      
      if (intervalos.length > 0) {
        const mediaIntervalo = intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
        console.log(`📊 Média de intervalo: ${mediaIntervalo.toFixed(1)} segundos`);
      }
      
      // Mostrar as 5 posições mais recentes
      rastreamentos.slice(0, 5).forEach((rastreamento, index) => {
        console.log(`${index + 1}. ID: ${rastreamento.id}`);
        console.log(`   Latitude: ${rastreamento.latitude}`);
        console.log(`   Longitude: ${rastreamento.longitude}`);
        console.log(`   Precisão: ${rastreamento.precisao || 'N/A'}m`);
        console.log(`   Velocidade: ${rastreamento.velocidade || 'N/A'} km/h`);
        console.log(`   Timestamp (UTC): ${rastreamento.timestamp.toISOString()}`);
        console.log(`   Timestamp (Brasil): ${formatBrazilianTime(rastreamento.timestamp)}`);
        console.log('   ---');
      });
    } else {
      console.log('❌ Nenhuma posição encontrada nos últimos 5 minutos');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar rastreamento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarRastreamentoRecente(); 