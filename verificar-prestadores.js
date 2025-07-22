const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarPrestadores() {
  try {
    console.log('🔍 Verificando prestadores cadastrados...\n');

    // Buscar todos os prestadores
    const prestadores = await prisma.prestador.findMany({
      include: {
        usuarioPrestador: true
      }
    });

    console.log(`📊 Total de prestadores: ${prestadores.length}\n`);

    if (prestadores.length === 0) {
      console.log('❌ Nenhum prestador cadastrado!');
      console.log('💡 Para testar, você pode:');
      console.log('   1. Cadastrar um prestador via painel admin');
      console.log('   2. Ou usar o script de cadastro automático');
      return;
    }

    console.log('👥 Prestadores cadastrados:');
    prestadores.forEach((prestador, index) => {
      console.log(`\n${index + 1}. ${prestador.nome}`);
      console.log(`   ID: ${prestador.id}`);
      console.log(`   CPF: ${prestador.cpf}`);
      console.log(`   Email: ${prestador.usuarioPrestador?.[0]?.email || 'N/A'}`);
      console.log(`   Telefone: ${prestador.telefone || 'N/A'}`);
      console.log(`   Ativo: ${prestador.usuarioPrestador?.[0]?.ativo ? '✅' : '❌'}`);
      
      if (prestador.usuarioPrestador?.[0]) {
        console.log(`   Credenciais de teste:`);
        console.log(`     Email: ${prestador.usuarioPrestador[0].email}`);
        console.log(`     Senha: ${prestador.cpf}`);
      }
    });

    console.log('\n💡 Para testar o login, use:');
    console.log('   Email: [email do prestador]');
    console.log('   Senha: [CPF do prestador]');

  } catch (error) {
    console.error('❌ Erro ao verificar prestadores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarPrestadores(); 