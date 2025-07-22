// Script para testar atualização de posição de rastreamento
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testarSalvarPosicao(prestadorId, ocorrenciaId) {
  // Gera uma posição aleatória próxima
  const latitude = -23.55 + Math.random() * 0.05;
  const longitude = -46.63 + Math.random() * 0.05;
  const velocidade = Math.random() * 60;
  const timestamp = new Date();

  const rastreamento = await prisma.rastreamentoPrestador.create({
    data: {
      prestador_id: prestadorId,
      ocorrencia_id: ocorrenciaId,
      latitude,
      longitude,
      velocidade,
      status: 'ativo',
      timestamp
    }
  });

  console.log('✅ Nova posição salva:', {
    id: rastreamento.id,
    prestador_id: rastreamento.prestador_id,
    ocorrencia_id: rastreamento.ocorrencia_id,
    latitude: rastreamento.latitude,
    longitude: rastreamento.longitude,
    velocidade: rastreamento.velocidade,
    timestamp: rastreamento.timestamp
  });
}

// IDs de teste (ajuste conforme necessário)
const prestadorId = 4; // ID do prestador
const ocorrenciaId = 119; // ID da ocorrência

testarSalvarPosicao(prestadorId, ocorrenciaId)
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 