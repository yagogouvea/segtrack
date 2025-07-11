const { PrismaClient } = require('@prisma/client');

async function activateUnaccent() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Ativando extensão unaccent...');
    
    // Ativar a extensão unaccent
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS unaccent`;
    
    console.log('✅ Extensão unaccent ativada com sucesso!');
    
    // Verificar se foi ativada
    const extensions = await prisma.$queryRaw`
      SELECT extname FROM pg_extension WHERE extname = 'unaccent'
    `;
    
    if (extensions.length > 0) {
      console.log('✅ Confirmação: extensão unaccent está ativa!');
      
      // Testar a função
      const testResult = await prisma.$queryRaw`
        SELECT unaccent('São Paulo') as result
      `;
      
      console.log('🧪 Teste da função unaccent:', testResult[0]);
      console.log('🎉 Tudo pronto! Agora a busca por região funcionará corretamente.');
    } else {
      console.log('❌ Erro: extensão não foi ativada corretamente.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao ativar extensão unaccent:', error);
    console.log('💡 Certifique-se de que você tem permissões de administrador no banco.');
  } finally {
    await prisma.$disconnect();
  }
}

activateUnaccent(); 