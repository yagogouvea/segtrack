const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarAtualizacaoPrestador() {
  try {
    console.log('🔍 Testando atualização de prestador...');
    
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
    
    // 2. Testar geocodificação manual
    const enderecoCompleto = `${prestador.endereco}, ${prestador.cidade}, ${prestador.estado}, Brasil`;
    console.log('🔍 Testando geocodificação para:', enderecoCompleto);
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.length > 0) {
      const novasCoordenadas = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
      console.log('✅ Novas coordenadas obtidas:', novasCoordenadas);
      
      // 3. Atualizar o prestador com as novas coordenadas
      const prestadorAtualizado = await prisma.prestador.update({
        where: { id: prestador.id },
        data: {
          endereco: prestador.endereco + ' (TESTE)',
          latitude: novasCoordenadas.latitude,
          longitude: novasCoordenadas.longitude
        }
      });
      
      console.log('✅ Prestador atualizado:', {
        id: prestadorAtualizado.id,
        endereco: prestadorAtualizado.endereco,
        latitude: prestadorAtualizado.latitude,
        longitude: prestadorAtualizado.longitude
      });
      
      // 4. Verificar se as coordenadas foram atualizadas no banco
      const prestadorVerificado = await prisma.prestador.findUnique({
        where: { id: prestador.id }
      });
      
      console.log('🔍 Verificação final:', {
        id: prestadorVerificado.id,
        endereco: prestadorVerificado.endereco,
        latitude: prestadorVerificado.latitude,
        longitude: prestadorVerificado.longitude
      });
      
    } else {
      console.log('❌ Não foi possível obter coordenadas para o endereço');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarAtualizacaoPrestador(); 