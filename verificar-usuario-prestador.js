const { PrismaClient } = require('@prisma/client');

async function verificarUsuarioPrestador() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando usuário prestador...');
    
    // Verificar se o usuário existe
    const usuario = await prisma.usuarioPrestador.findFirst({
      where: { 
        email: 'yago@segtrackpr.com.br',
        ativo: true
      },
      include: {
        prestador: true
      }
    });
    
    if (!usuario) {
      console.log('❌ Usuário prestador não encontrado');
      
      // Listar todos os usuários prestadores
      console.log('\n📋 Listando todos os usuários prestadores:');
      const todosUsuarios = await prisma.usuarioPrestador.findMany({
        include: {
          prestador: true
        }
      });
      
      todosUsuarios.forEach(u => {
        console.log(`- ID: ${u.id}, Email: ${u.email}, Ativo: ${u.ativo}, Prestador: ${u.prestador?.nome}`);
      });
      
      return;
    }
    
    console.log('✅ Usuário encontrado:');
    console.log(`- ID: ${usuario.id}`);
    console.log(`- Email: ${usuario.email}`);
    console.log(`- Ativo: ${usuario.ativo}`);
    console.log(`- Prestador: ${usuario.prestador?.nome}`);
    console.log(`- Senha hash: ${usuario.senha_hash.substring(0, 20)}...`);
    
    // Verificar se a senha está correta
    const bcrypt = require('bcrypt');
    const senhaTeste = '123456';
    const senhaValida = await bcrypt.compare(senhaTeste, usuario.senha_hash);
    
    console.log(`\n🔐 Testando senha '${senhaTeste}': ${senhaValida ? '✅ Válida' : '❌ Inválida'}`);
    
    if (!senhaValida) {
      console.log('\n💡 Tentando outras senhas comuns...');
      const senhasComuns = ['123456', 'senha123', 'password', 'admin', 'prestador'];
      
      for (const senha of senhasComuns) {
        const valida = await bcrypt.compare(senha, usuario.senha_hash);
        if (valida) {
          console.log(`✅ Senha encontrada: ${senha}`);
          break;
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarUsuarioPrestador(); 