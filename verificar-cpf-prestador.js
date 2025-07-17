const { PrismaClient } = require('@prisma/client');

async function verificarCPFPrestador() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando CPF do prestador...');
    
    // Buscar o prestador Yago Gouvea
    const prestador = await prisma.prestador.findFirst({
      where: { 
        nome: 'Yago Gouvea'
      }
    });
    
    if (!prestador) {
      console.log('❌ Prestador Yago Gouvea não encontrado');
      
      // Listar todos os prestadores
      console.log('\n📋 Listando todos os prestadores:');
      const todosPrestadores = await prisma.prestador.findMany({
        select: {
          id: true,
          nome: true,
          cpf: true,
          email: true
        }
      });
      
      todosPrestadores.forEach(p => {
        console.log(`- Nome: ${p.nome}, CPF: ${p.cpf}, Email: ${p.email}`);
      });
      
      return;
    }
    
    console.log('✅ Prestador encontrado:');
    console.log(`- Nome: ${prestador.nome}`);
    console.log(`- CPF: ${prestador.cpf}`);
    console.log(`- Email: ${prestador.email}`);
    
    // Verificar se existe usuário prestador com este email
    const usuarioPrestador = await prisma.usuarioPrestador.findFirst({
      where: { 
        email: 'yago@segtrackpr.com.br'
      }
    });
    
    if (usuarioPrestador) {
      console.log('\n👤 Usuário prestador encontrado:');
      console.log(`- Email: ${usuarioPrestador.email}`);
      console.log(`- Ativo: ${usuarioPrestador.ativo}`);
      
      // Testar se o CPF funciona como senha
      const bcrypt = require('bcrypt');
      const senhaValida = await bcrypt.compare(prestador.cpf, usuarioPrestador.senha_hash);
      
      console.log(`\n🔐 Testando CPF como senha: ${senhaValida ? '✅ Válida' : '❌ Inválida'}`);
      
      if (!senhaValida) {
        console.log('💡 Tentando CPF sem formatação...');
        const cpfLimpo = prestador.cpf.replace(/[.\-\/]/g, '');
        const senhaValidaLimpo = await bcrypt.compare(cpfLimpo, usuarioPrestador.senha_hash);
        console.log(`CPF limpo como senha: ${senhaValidaLimpo ? '✅ Válida' : '❌ Inválida'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarCPFPrestador(); 