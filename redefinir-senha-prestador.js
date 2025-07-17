const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function redefinirSenhaPrestador() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Redefinindo senha do usuário prestador...');
    
    const email = 'yago@segtrackpr.com.br';
    const novaSenha = '123456';
    
    // Gerar hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    
    // Atualizar a senha no banco
    const usuarioAtualizado = await prisma.usuarioPrestador.update({
      where: { email },
      data: {
        senha_hash: senhaHash
      },
      include: {
        prestador: true
      }
    });
    
    console.log('✅ Senha redefinida com sucesso!');
    console.log(`- Email: ${usuarioAtualizado.email}`);
    console.log(`- Nova senha: ${novaSenha}`);
    console.log(`- Prestador: ${usuarioAtualizado.prestador?.nome}`);
    
    // Verificar se a senha está correta
    const senhaValida = await bcrypt.compare(novaSenha, usuarioAtualizado.senha_hash);
    console.log(`- Senha válida: ${senhaValida ? '✅ Sim' : '❌ Não'}`);
    
  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
  } finally {
    await prisma.$disconnect();
  }
}

redefinirSenhaPrestador(); 