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

async function verificarTodosRastreamentos() {
  try {
    console.log('🔍 Verificando todos os rastreamentos do prestador 133...');
    
    const rastreamentos = await prisma.rastreamentoPrestador.findMany({
      where: {
        prestador_id: 133
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 20 // Últimas 20 posições
    });
    
    console.log(`✅ Encontradas ${rastreamentos.length} posições:`);
    console.log('');
    
    rastreamentos.forEach((rastreamento, index) => {
      console.log(`${index + 1}. ID: ${rastreamento.id}`);
      console.log(`   Latitude: ${rastreamento.latitude}`);
      console.log(`   Longitude: ${rastreamento.longitude}`);
      console.log(`   Precisão: ${rastreamento.precisao || 'N/A'}m`);
      console.log(`   Velocidade: ${rastreamento.velocidade || 'N/A'} km/h`);
      console.log(`   Status: ${rastreamento.status}`);
      console.log(`   Timestamp (UTC): ${rastreamento.timestamp.toISOString()}`);
      console.log(`   Timestamp (Brasil): ${formatBrazilianTime(rastreamento.timestamp)}`);
      console.log('   ---');
    });
    
    // Estatísticas
    if (rastreamentos.length > 1) {
      console.log('📊 ESTATÍSTICAS:');
      
      // Calcular intervalos
      const intervalos = [];
      for (let i = 0; i < rastreamentos.length - 1; i++) {
        const diff = rastreamentos[i].timestamp - rastreamentos[i + 1].timestamp;
        const segundos = Math.round(diff / 1000);
        intervalos.push(segundos);
      }
      
      const mediaIntervalo = intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
      const minIntervalo = Math.min(...intervalos);
      const maxIntervalo = Math.max(...intervalos);
      
      console.log(`   Média de intervalo: ${mediaIntervalo.toFixed(1)} segundos`);
      console.log(`   Menor intervalo: ${minIntervalo} segundos`);
      console.log(`   Maior intervalo: ${maxIntervalo} segundos`);
      console.log(`   Total de posições: ${rastreamentos.length}`);
      
      // Verificar se há posições muito antigas
      const agora = new Date();
      const posicaoMaisAntiga = rastreamentos[rastreamentos.length - 1];
      const diffHoras = (agora - posicaoMaisAntiga.timestamp) / (1000 * 60 * 60);
      
      console.log(`   Posição mais antiga: ${formatBrazilianTime(posicaoMaisAntiga.timestamp)} (${diffHoras.toFixed(1)} horas atrás)`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar rastreamentos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTodosRastreamentos(); 