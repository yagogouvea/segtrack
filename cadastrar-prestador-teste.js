const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cadastrarPrestadorTeste() {
  try {
    console.log('🚀 Cadastrando prestador de teste...\n');

    // Verificar se já existe
    const prestadorExistente = await prisma.prestador.findFirst({
      where: { cpf: '12345678901' }
    });

    if (prestadorExistente) {
      console.log('✅ Prestador de teste já existe!');
      console.log('📧 Email: prestador@teste.com');
      console.log('🔑 Senha: 12345678901');
      return;
    }

    // Criar prestador
    const prestador = await prisma.prestador.create({
      data: {
        nome: 'Prestador Teste',
        cpf: '12345678901',
        telefone: '(11) 99999-9999',
        email: 'prestador@teste.com',
        aprovado: true
      }
    });

    console.log('✅ Prestador criado:', prestador.id);

    // Criar usuário prestador
    const usuarioPrestador = await prisma.usuarioPrestador.create({
      data: {
        email: 'prestador@teste.com',
        prestador_id: prestador.id,
        ativo: true
      }
    });

    console.log('✅ Usuário prestador criado:', usuarioPrestador.id);

    console.log('\n🎉 Prestador de teste cadastrado com sucesso!');
    console.log('📧 Email: prestador@teste.com');
    console.log('🔑 Senha: 12345678901');
    console.log('\n💡 Use essas credenciais para testar o login no app!');

  } catch (error) {
    console.error('❌ Erro ao cadastrar prestador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cadastrarPrestadorTeste(); 