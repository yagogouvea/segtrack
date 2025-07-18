const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function criarAuthParaClientes() {
  try {
    console.log('🔍 Verificando clientes sem autenticação...');
    
    // Buscar todos os clientes
    const clientes = await prisma.cliente.findMany({
      select: {
        id: true,
        nome: true,
        nome_fantasia: true,
        cnpj: true,
        cidade: true,
        estado: true
      }
    });
    
    console.log(`📊 Total de clientes encontrados: ${clientes.length}`);
    
    let clientesSemAuth = 0;
    let clientesComAuth = 0;
    let clientesCriados = 0;
    
    for (const cliente of clientes) {
      // Verificar se já existe na tabela clienteAuth
      const clienteAuth = await prisma.clienteAuth.findUnique({
        where: { cnpj_normalizado: cliente.cnpj }
      });
      
      if (!clienteAuth) {
        clientesSemAuth++;
        console.log(`\n🔧 Criando autenticação para cliente: ${cliente.nome_fantasia || cliente.nome} (CNPJ: ${cliente.cnpj})`);
        
        try {
          // Criar hash da senha (usando o CNPJ como senha padrão)
          const senhaHash = await bcrypt.hash(cliente.cnpj, 10);
          
          // Criar registro de autenticação
          await prisma.clienteAuth.create({
            data: {
              cliente_id: cliente.id,
              cnpj_normalizado: cliente.cnpj,
              senha_hash: senhaHash,
              ativo: true
            }
          });
          
          console.log(`✅ Autenticação criada com sucesso para ${cliente.nome_fantasia || cliente.nome}`);
          console.log(`   📧 Credenciais: CNPJ: ${cliente.cnpj}, Senha: ${cliente.cnpj}`);
          clientesCriados++;
          
        } catch (error) {
          console.error(`❌ Erro ao criar autenticação para ${cliente.nome_fantasia || cliente.nome}:`, error.message);
        }
      } else {
        clientesComAuth++;
        console.log(`✅ ${cliente.nome_fantasia || cliente.nome} já tem autenticação`);
      }
    }
    
    console.log('\n📈 Resumo:');
    console.log(`   Total de clientes: ${clientes.length}`);
    console.log(`   Já tinham autenticação: ${clientesComAuth}`);
    console.log(`   Precisavam de autenticação: ${clientesSemAuth}`);
    console.log(`   Autenticações criadas: ${clientesCriados}`);
    
    if (clientesCriados > 0) {
      console.log('\n💡 Instruções para os clientes:');
      console.log('   - Use o CNPJ como usuário e senha para fazer login');
      console.log('   - Acesse: http://localhost:3000 (desenvolvimento)');
      console.log('   - Ou: https://cliente.segtrack.com.br (produção)');
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar clientes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criarAuthParaClientes(); 