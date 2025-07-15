const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listarClientes() {
  try {
    console.log('🔍 Listando todos os clientes do banco de dados...\n');
    
    const clientes = await prisma.cliente.findMany({
      select: {
        id: true,
        nome: true,
        cnpj: true,
        email: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    console.log(`📊 Total de clientes encontrados: ${clientes.length}\n`);
    
    if (clientes.length === 0) {
      console.log('❌ Nenhum cliente encontrado no banco de dados.');
      return;
    }

    console.log('📋 Lista de clientes:');
    console.log('='.repeat(80));
    
    clientes.forEach((cliente, index) => {
      console.log(`${index + 1}. ID: ${cliente.id}`);
      console.log(`   Nome: ${cliente.nome}`);
      console.log(`   CNPJ: ${cliente.cnpj}`);
      console.log(`   Email: ${cliente.email}`);
      console.log(`   Senha: N/A`);
      console.log(`   Ativo: N/A`);
      console.log(`   Criado em: N/A`);
      console.log('-'.repeat(40));
    });

    // Mostrar alguns clientes ativos para teste
    const clientesAtivos = clientes.filter(c => c.ativo);
    if (clientesAtivos.length > 0) {
      console.log('\n🎯 Clientes ativos para teste de login:');
      clientesAtivos.slice(0, 5).forEach((cliente, index) => {
        console.log(`${index + 1}. ${cliente.nome} (${cliente.cnpj})`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao listar clientes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listarClientes(); 