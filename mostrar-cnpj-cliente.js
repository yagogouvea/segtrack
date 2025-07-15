const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function mostrarCnpjCliente() {
  try {
    const nomeBusca = 'SASCAR';
    const clientes = await prisma.cliente.findMany({
      where: {
        nome: {
          contains: nomeBusca,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        nome: true,
        cnpj: true
      }
    });

    if (clientes.length === 0) {
      console.log('❌ Nenhum cliente encontrado com o nome:', nomeBusca);
      return;
    }

    console.log(`Clientes encontrados com nome contendo '${nomeBusca}':`);
    clientes.forEach((cliente, idx) => {
      console.log(`${idx + 1}. ID: ${cliente.id}`);
      console.log(`   Nome: ${cliente.nome}`);
      console.log(`   CNPJ salvo no banco: '${cliente.cnpj}'`);
      console.log('-'.repeat(40));
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
  } finally {
    await prisma.$disconnect();
  }
}

mostrarCnpjCliente(); 