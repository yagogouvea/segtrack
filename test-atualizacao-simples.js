const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarAtualizacaoSimples() {
  try {
    console.log('🧪 Testando atualização simples de prestador...\n');
    
    // 1. Buscar um prestador existente
    const prestador = await prisma.prestador.findFirst({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    if (!prestador) {
      console.log('❌ Nenhum prestador com coordenadas encontrado');
      return;
    }
    
    console.log('📍 Prestador encontrado:', {
      id: prestador.id,
      nome: prestador.nome,
      endereco: prestador.endereco,
      cidade: prestador.cidade,
      estado: prestador.estado,
      latitude: prestador.latitude,
      longitude: prestador.longitude
    });
    
    // 2. Simular novas coordenadas
    const coordenadasAntigas = {
      latitude: prestador.latitude,
      longitude: prestador.longitude
    };
    
    const coordenadasNovas = {
      latitude: prestador.latitude + 0.001,
      longitude: prestador.longitude + 0.001
    };
    
    console.log('\n🔄 Atualizando prestador no banco...');
    console.log('📍 Coordenadas antigas:', coordenadasAntigas);
    console.log('📍 Coordenadas novas:', coordenadasNovas);
    
    // 3. Atualizar o prestador
    const prestadorAtualizado = await prisma.prestador.update({
      where: { id: prestador.id },
      data: {
        endereco: prestador.endereco + ' (TESTE ATUALIZAÇÃO)',
        latitude: coordenadasNovas.latitude,
        longitude: coordenadasNovas.longitude
      }
    });
    
    console.log('✅ Prestador atualizado:', {
      id: prestadorAtualizado.id,
      endereco: prestadorAtualizado.endereco,
      latitude: prestadorAtualizado.latitude,
      longitude: prestadorAtualizado.longitude
    });
    
    // 4. Verificar se as coordenadas foram atualizadas
    const prestadorVerificado = await prisma.prestador.findUnique({
      where: { id: prestador.id }
    });
    
    console.log('\n🔍 Verificação final:');
    console.log('📍 Coordenadas no banco:', {
      latitude: prestadorVerificado.latitude,
      longitude: prestadorVerificado.longitude
    });
    
    if (prestadorVerificado.latitude === coordenadasNovas.latitude && 
        prestadorVerificado.longitude === coordenadasNovas.longitude) {
      console.log('✅ Coordenadas foram atualizadas com sucesso!');
    } else {
      console.log('❌ Coordenadas não foram atualizadas corretamente');
    }
    
    // 5. Testar a API de mapa
    console.log('\n🌐 Testando API de mapa...');
    const prestadoresMapa = await prisma.prestador.findMany({
      where: {
        id: prestador.id
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        latitude: true,
        longitude: true,
        cidade: true,
        estado: true,
        bairro: true,
        regioes: { select: { regiao: true } },
        funcoes: { select: { funcao: true } }
      }
    });
    
    const prestadorNoMapa = prestadoresMapa.find(p => p.id === prestador.id);
    if (prestadorNoMapa) {
      console.log('✅ Prestador encontrado na API de mapa:', {
        id: prestadorNoMapa.id,
        nome: prestadorNoMapa.nome,
        latitude: prestadorNoMapa.latitude,
        longitude: prestadorNoMapa.longitude
      });
      
      if (prestadorNoMapa.latitude === coordenadasNovas.latitude && 
          prestadorNoMapa.longitude === coordenadasNovas.longitude) {
        console.log('✅ API de mapa retornou as coordenadas atualizadas!');
      } else {
        console.log('❌ API de mapa não retornou as coordenadas atualizadas');
      }
    } else {
      console.log('❌ Prestador não encontrado na API de mapa');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarAtualizacaoSimples(); 