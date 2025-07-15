const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function normalizarCNPJ(cnpj) {
  return cnpj.replace(/\D/g, '');
}

async function normalizarTodosCNPJs() {
  try {
    const clientes = await prisma.cliente.findMany({ select: { id: true, cnpj: true } });
    let alterados = 0;
    for (const cliente of clientes) {
      const cnpjNormalizado = normalizarCNPJ(cliente.cnpj);
      if (cliente.cnpj !== cnpjNormalizado) {
        await prisma.cliente.update({
          where: { id: cliente.id },
          data: { cnpj: cnpjNormalizado }
        });
        console.log(`Atualizado: ID ${cliente.id} - '${cliente.cnpj}' => '${cnpjNormalizado}'`);
        alterados++;
      }
    }
    console.log(`\nTotal de clientes atualizados: ${alterados}`);
  } catch (error) {
    console.error('Erro ao normalizar CNPJs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

normalizarTodosCNPJs(); 