const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testando conexão com o banco de dados...');
  console.log('📋 Configurações:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'NÃO definida');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não está definida no arquivo .env');
    console.log('💡 Crie um arquivo .env na pasta backend com:');
    console.log('DATABASE_URL="postgresql://postgres:%t%E6G_$@localhost:5432/segtrack"');
    return;
  }

  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn']
  });

  try {
    console.log('🔄 Tentando conectar ao banco...');
    
    // Testar conexão básica
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query de teste executada:', result);
    
    // Verificar se as tabelas existem
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📊 Tabelas encontradas:', tables.map(t => t.table_name));
    
    // Testar tabela de ocorrências
    try {
      const ocorrencias = await prisma.ocorrencia.findMany({ take: 1 });
      console.log('✅ Tabela ocorrencia acessível, registros encontrados:', ocorrencias.length);
    } catch (error) {
      console.error('❌ Erro ao acessar tabela ocorrencia:', error.message);
    }
    
    // Testar tabela de prestadores
    try {
      const prestadores = await prisma.prestador.findMany({ take: 1 });
      console.log('✅ Tabela prestador acessível, registros encontrados:', prestadores.length);
    } catch (error) {
      console.error('❌ Erro ao acessar tabela prestador:', error.message);
    }
    
    // Testar tabela de clientes
    try {
      const clientes = await prisma.cliente.findMany({ take: 1 });
      console.log('✅ Tabela cliente acessível, registros encontrados:', clientes.length);
    } catch (error) {
      console.error('❌ Erro ao acessar tabela cliente:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('📋 Detalhes do erro:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 PostgreSQL não está rodando. Inicie o serviço ou use Docker:');
      console.log('docker run --name postgres-segtrack -e POSTGRES_PASSWORD=%t%E6G_$ -e POSTGRES_DB=segtrack -p 5432:5432 -d postgres:latest');
    } else if (error.code === 'P1001') {
      console.log('💡 Problema de autenticação. Verifique usuário e senha no DATABASE_URL');
    } else if (error.code === 'P1002') {
      console.log('💡 Banco de dados não existe. Crie o banco "segtrack"');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection().catch(console.error); 