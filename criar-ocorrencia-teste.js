const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function criarOcorrenciaTeste() {
  try {
    // Buscar o cliente JBS pelo nome ou CNPJ
    const cliente = await prisma.cliente.findFirst({
      where: {
        OR: [
          { nome: { contains: 'JBS', mode: 'insensitive' } },
          { nome_fantasia: { contains: 'JBS', mode: 'insensitive' } },
          { cnpj: { contains: '02916265002707' } }
        ]
      }
    });

    if (!cliente) {
      console.log('Cliente JBS não encontrado.');
      return;
    }

    const novaOcorrencia = await prisma.ocorrencia.create({
      data: {
        placa1: 'TESTE1234',
        cliente: cliente.nome, // ou cliente.nome_fantasia
        tipo: 'Teste',
        status: 'em_andamento',
        criado_em: new Date(),
        descricao: 'Ocorrência de teste criada via script',
      }
    });

    console.log('✅ Ocorrência de teste criada com sucesso:', novaOcorrencia);
  } catch (error) {
    console.error('❌ Erro ao criar ocorrência de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criarOcorrenciaTeste(); 