const { PrismaClient } = require('@prisma/client');

console.log('🔍 Verificando configuração do banco de dados...');
console.log('');

// Verificar se DATABASE_URL está definida
if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL não está definida!');
  console.log('');
  console.log('📋 Para resolver isso, você tem algumas opções:');
  console.log('');
  console.log('1. 🚀 Se você está usando Railway:');
  console.log('   - Acesse o Railway Dashboard');
  console.log('   - Vá no serviço PostgreSQL');
  console.log('   - Clique em "Connect" → "PostgreSQL"');
  console.log('   - Copie a URL de conexão');
  console.log('   - Crie um arquivo .env na pasta backend com:');
  console.log('     DATABASE_URL="sua_url_aqui"');
  console.log('');
  console.log('2. 🏠 Para desenvolvimento local:');
  console.log('   - Instale PostgreSQL localmente');
  console.log('   - Crie um banco de dados');
  console.log('   - Use: DATABASE_URL="postgresql://usuario:senha@localhost:5432/segtrack"');
  console.log('');
  console.log('3. 🔗 Para usar o banco remoto do Railway:');
  console.log('   - Acesse o Railway Dashboard');
  console.log('   - Vá no serviço PostgreSQL');
  console.log('   - Copie a URL de conexão');
  console.log('   - Crie um arquivo .env na pasta backend');
  console.log('');
  return;
}

console.log('✅ DATABASE_URL encontrada!');
console.log('🔗 Tentando conectar ao banco...');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com o banco estabelecida com sucesso!');
    
    // Testar uma query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query de teste executada com sucesso:', result);
    
    // Verificar se há clientes no banco
    const clientesCount = await prisma.cliente.count();
    console.log(`📊 Total de clientes no banco: ${clientesCount}`);
    
    if (clientesCount > 0) {
      const clientes = await prisma.cliente.findMany({
        take: 3,
        select: { nome: true, nome_fantasia: true, cnpj: true }
      });
      console.log('📋 Primeiros clientes:', clientes);
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error.message);
    console.log('');
    console.log('🔧 Possíveis soluções:');
    console.log('1. Verifique se a DATABASE_URL está correta');
    console.log('2. Verifique se o banco está acessível');
    console.log('3. Verifique se as credenciais estão corretas');
    console.log('4. Se usando Railway, verifique se o serviço está ativo');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 