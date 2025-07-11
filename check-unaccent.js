const { PrismaClient } = require('@prisma/client');

async function checkUnaccent() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando se a extensão unaccent está ativa...');
    
    // Verificar se a extensão existe
    const extensions = await prisma.$queryRaw`
      SELECT extname FROM pg_extension WHERE extname = 'unaccent'
    `;
    
    if (extensions.length === 0) {
      console.log('❌ Extensão unaccent NÃO está ativa!');
      console.log('📝 Para ativar, execute no seu banco PostgreSQL:');
      console.log('   CREATE EXTENSION IF NOT EXISTS unaccent;');
      return false;
    }
    
    console.log('✅ Extensão unaccent está ativa!');
    
    // Testar a função unaccent
    const testResult = await prisma.$queryRaw`
      SELECT unaccent('São Paulo') as result
    `;
    
    console.log('🧪 Teste da função unaccent:', testResult[0]);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar unaccent:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

checkUnaccent(); 