const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarClienteCEBBS() {
  try {
    console.log('🔍 Verificando cliente CEBBS...');
    
    const cnpj = '14117458000130';
    
    // Verificar se existe na tabela cliente
    const cliente = await prisma.cliente.findFirst({
      where: { cnpj: cnpj }
    });
    
    if (!cliente) {
      console.log('❌ Cliente não encontrado na tabela cliente');
      return;
    }
    
    console.log('✅ Cliente encontrado na tabela cliente:');
    console.log('   ID:', cliente.id);
    console.log('   Nome:', cliente.nome);
    console.log('   Nome Fantasia:', cliente.nome_fantasia);
    console.log('   CNPJ:', cliente.cnpj);
    console.log('   Cidade:', cliente.cidade);
    console.log('   Estado:', cliente.estado);
    
    // Verificar se existe na tabela clienteAuth
    const clienteAuth = await prisma.clienteAuth.findUnique({
      where: { cnpj_normalizado: cnpj },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            nome_fantasia: true,
            cnpj: true,
            cidade: true,
            estado: true
          }
        }
      }
    });
    
    if (!clienteAuth) {
      console.log('❌ Cliente não encontrado na tabela clienteAuth');
      console.log('💡 Precisa criar registro de autenticação');
      return;
    }
    
    console.log('✅ Cliente encontrado na tabela clienteAuth:');
    console.log('   ID Auth:', clienteAuth.id);
    console.log('   Cliente ID:', clienteAuth.cliente_id);
    console.log('   CNPJ Normalizado:', clienteAuth.cnpj_normalizado);
    console.log('   Ativo:', clienteAuth.ativo);
    console.log('   Tem senha hash:', !!clienteAuth.senha_hash);
    
    // Testar login
    console.log('\n🧪 Testando login...');
    
    const bcrypt = require('bcrypt');
    const senhaTeste = cnpj; // Senha padrão é o CNPJ
    
    const senhaValida = await bcrypt.compare(senhaTeste, clienteAuth.senha_hash);
    
    if (senhaValida) {
      console.log('✅ Senha válida - login funcionaria');
    } else {
      console.log('❌ Senha inválida - problema no login');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar cliente:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarClienteCEBBS(); 