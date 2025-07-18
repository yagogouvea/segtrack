const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function corrigirJBSAuth() {
  try {
    console.log('🔍 Verificando problema com cliente JBS...');
    
    // Buscar o cliente JBS
    const clienteJBS = await prisma.cliente.findFirst({
      where: { 
        nome: { contains: 'JBS' }
      }
    });
    
    if (!clienteJBS) {
      console.log('❌ Cliente JBS não encontrado');
      return;
    }
    
    console.log('✅ Cliente JBS encontrado:');
    console.log('   ID:', clienteJBS.id);
    console.log('   Nome:', clienteJBS.nome);
    console.log('   CNPJ:', clienteJBS.cnpj);
    
    // Verificar se já existe na tabela clienteAuth
    const clienteAuth = await prisma.clienteAuth.findFirst({
      where: { cliente_id: clienteJBS.id }
    });
    
    if (clienteAuth) {
      console.log('✅ Cliente JBS já tem autenticação:');
      console.log('   ID Auth:', clienteAuth.id);
      console.log('   CNPJ Normalizado:', clienteAuth.cnpj_normalizado);
      console.log('   Ativo:', clienteAuth.ativo);
    } else {
      console.log('❌ Cliente JBS não tem autenticação');
    }
    
    // Listar todos os registros de autenticação para este cliente
    const todasAuth = await prisma.clienteAuth.findMany({
      where: { cliente_id: clienteJBS.id }
    });
    
    console.log(`📊 Total de registros de autenticação para JBS: ${todasAuth.length}`);
    
    if (todasAuth.length > 1) {
      console.log('⚠️ Cliente JBS tem múltiplos registros de autenticação:');
      todasAuth.forEach((auth, index) => {
        console.log(`   ${index + 1}. ID: ${auth.id}, CNPJ: ${auth.cnpj_normalizado}, Ativo: ${auth.ativo}`);
      });
      
      // Manter apenas o primeiro registro e desativar os outros
      console.log('\n🔧 Corrigindo registros duplicados...');
      
      for (let i = 1; i < todasAuth.length; i++) {
        await prisma.clienteAuth.update({
          where: { id: todasAuth[i].id },
          data: { ativo: false }
        });
        console.log(`   Desativado registro ${todasAuth[i].id}`);
      }
      
      console.log('✅ Registros duplicados corrigidos');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir JBS:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corrigirJBSAuth(); 