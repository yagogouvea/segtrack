// Teste de conexão com banco de dados
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    
    // Testar conexão básica
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');
    
    // Contar total de prestadores
    const totalPrestadores = await prisma.prestador.count();
    console.log('📊 Total de prestadores no banco:', totalPrestadores);
    
    // Testar query do mapa
    console.log('🔍 Testando query do mapa...');
    const prestadoresMapa = await prisma.prestador.findMany({
      select: {
        id: true,
        nome: true,
        telefone: true,
        latitude: true,
        longitude: true,
        cidade: true,
        estado: true,
        bairro: true,
        regioes: { select: { regiao: true } },
        funcoes: { select: { funcao: true } }
      }
    });
    
    console.log('✅ Query do mapa executada com sucesso');
    console.log('📊 Prestadores retornados:', prestadoresMapa.length);
    
    if (prestadoresMapa.length > 0) {
      console.log('📋 Primeiro prestador:', {
        id: prestadoresMapa[0].id,
        nome: prestadoresMapa[0].nome,
        latitude: prestadoresMapa[0].latitude,
        longitude: prestadoresMapa[0].longitude,
        regioes: prestadoresMapa[0].regioes.length,
        funcoes: prestadoresMapa[0].funcoes.length
      });
    }
    
    // Verificar prestadores sem coordenadas
    const semCoordenadas = prestadoresMapa.filter(p => !p.latitude || !p.longitude);
    console.log('⚠️ Prestadores sem coordenadas:', semCoordenadas.length);
    
    if (semCoordenadas.length > 0) {
      console.log('📋 Exemplos de prestadores sem coordenadas:');
      semCoordenadas.slice(0, 3).forEach(p => {
        console.log(`  - ID: ${p.id}, Nome: ${p.nome}, Cidade: ${p.cidade}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão com banco:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection(); 