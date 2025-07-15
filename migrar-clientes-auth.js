const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Função para normalizar CNPJ (remover pontos, traços e barras)
function normalizarCNPJ(cnpj) {
  return cnpj.replace(/[.\-\/]/g, '');
}

async function migrarClientesParaAuth() {
  try {
    console.log('🚀 Iniciando migração de clientes para tabela de autenticação...\n');
    
    // Buscar todos os clientes
    const clientes = await prisma.cliente.findMany({
      select: {
        id: true,
        nome: true,
        cnpj: true
      }
    });

    console.log(`📊 Total de clientes encontrados: ${clientes.length}\n`);
    
    if (clientes.length === 0) {
      console.log('❌ Nenhum cliente encontrado para migrar.');
      return;
    }

    let migrados = 0;
    let erros = 0;

    for (const cliente of clientes) {
      try {
        // Normalizar CNPJ
        const cnpjNormalizado = normalizarCNPJ(cliente.cnpj);
        
        // Verificar se já existe registro de auth para este cliente
        const authExistente = await prisma.clienteAuth.findUnique({
          where: { cliente_id: cliente.id }
        });

        if (authExistente) {
          console.log(`⏭️  Cliente ${cliente.id} (${cliente.nome}) já possui registro de auth. Pulando...`);
          continue;
        }

        // Verificar se já existe outro cliente com este CNPJ normalizado
        const cnpjExistente = await prisma.clienteAuth.findUnique({
          where: { cnpj_normalizado: cnpjNormalizado }
        });

        if (cnpjExistente) {
          console.log(`⚠️  CNPJ ${cnpjNormalizado} já existe para cliente ${cnpjExistente.cliente_id}. Pulando cliente ${cliente.id}...`);
          continue;
        }

        // Gerar hash da senha (CNPJ normalizado como senha padrão)
        const senhaHash = await bcrypt.hash(cnpjNormalizado, 10);

        // Criar registro de autenticação
        await prisma.clienteAuth.create({
          data: {
            cliente_id: cliente.id,
            cnpj_normalizado: cnpjNormalizado,
            senha_hash: senhaHash,
            ativo: true
          }
        });

        console.log(`✅ Cliente ${cliente.id} (${cliente.nome}) migrado com sucesso!`);
        console.log(`   CNPJ original: ${cliente.cnpj}`);
        console.log(`   CNPJ normalizado: ${cnpjNormalizado}`);
        console.log(`   Senha padrão: ${cnpjNormalizado}`);
        console.log('-'.repeat(50));
        
        migrados++;
        
      } catch (error) {
        console.error(`❌ Erro ao migrar cliente ${cliente.id} (${cliente.nome}):`, error.message);
        erros++;
      }
    }

    console.log('\n📋 Resumo da migração:');
    console.log(`✅ Clientes migrados com sucesso: ${migrados}`);
    console.log(`❌ Erros: ${erros}`);
    console.log(`📊 Total processado: ${clientes.length}`);

    if (migrados > 0) {
      console.log('\n🎉 Migração concluída!');
      console.log('📝 Credenciais de acesso:');
      console.log('   - Usuário: CNPJ normalizado (apenas números)');
      console.log('   - Senha: CNPJ normalizado (apenas números)');
      console.log('   - Exemplo: 03112879000151');
    }

  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrarClientesParaAuth(); 