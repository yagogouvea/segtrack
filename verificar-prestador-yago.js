const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarPrestador() {
  try {
    console.log('🔍 Verificando prestador yago@segtrackpr.co...');
    
    // Verificar se existe um usuário com este email
    const usuario = await prisma.usuario.findUnique({
      where: { email: 'yago@segtrackpr.co' }
    });
    
    if (usuario) {
      console.log('✅ Usuário encontrado:', {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      });
      
      // Se for prestador, verificar se existe na tabela UsuarioPrestador
      if (usuario.tipo === 'prestador') {
        const usuarioPrestador = await prisma.usuarioPrestador.findUnique({
          where: { id: usuario.id }
        });
        
        if (usuarioPrestador) {
          const prestador = await prisma.prestador.findUnique({
            where: { id: usuarioPrestador.prestador_id }
          });
          
          console.log('✅ Prestador encontrado:', {
            id: prestador.id,
            nome: prestador.nome,
            email: prestador.email,
            cpf: prestador.cpf
          });
        } else {
          console.log('❌ Usuário não está vinculado a um prestador');
        }
      }
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarPrestador(); 