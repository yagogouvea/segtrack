const { ensurePrisma } = require('./src/lib/prisma');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testando conexão com o banco de dados...');
    
    const db = await ensurePrisma();
    console.log('✅ Conexão com banco estabelecida');
    
    // Testar query simples
    const count = await db.prestador.count();
    console.log('✅ Total de prestadores:', count);
    
    // Testar query do mapa
    const prestadoresMapa = await db.prestador.findMany({
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
      },
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    console.log('✅ Prestadores com coordenadas:', prestadoresMapa.length);
    
    if (prestadoresMapa.length > 0) {
      console.log('✅ Primeiro prestador:', {
        id: prestadoresMapa[0].id,
        nome: prestadoresMapa[0].nome,
        latitude: prestadoresMapa[0].latitude,
        longitude: prestadoresMapa[0].longitude
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar com banco:', error);
  }
}

testDatabaseConnection(); 