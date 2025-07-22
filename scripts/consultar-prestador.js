const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function consultarPrestador() {
  try {
    console.log('🔍 Consultando prestador...');

    const usuarioPrestador = await prisma.usuarioPrestador.findFirst({
      where: { 
        email: 'yago@segtrackpr.com.br' 
      },
      include: {
        prestador: true
      }
    });

    if (!usuarioPrestador) {
      console.log('❌ Prestador não encontrado');
      return;
    }

    console.log('✅ Prestador encontrado:');
    console.log('📧 Email:', usuarioPrestador.email);
    console.log('👤 Nome:', usuarioPrestador.prestador.nome);
    console.log('🆔 CPF:', usuarioPrestador.prestador.cpf);
    console.log('📱 Telefone:', usuarioPrestador.prestador.telefone);
    console.log('✅ Ativo:', usuarioPrestador.ativo);
    console.log('🔑 Senha Hash:', usuarioPrestador.senha_hash);

    // Testar se o CPF é igual à senha fornecida
    const senhaFornecida = '396323056885';
    console.log('\n🔍 Testando credenciais:');
    console.log('📧 Email fornecido: yago@segtrackpr.com.br');
    console.log('🔑 Senha fornecida:', senhaFornecida);
    console.log('🆔 CPF no banco:', usuarioPrestador.prestador.cpf);
    console.log('✅ CPF igual à senha?', senhaFornecida === usuarioPrestador.prestador.cpf);

  } catch (error) {
    console.error('❌ Erro ao consultar prestador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

consultarPrestador(); 