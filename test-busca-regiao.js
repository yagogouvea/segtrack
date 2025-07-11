const { PrismaClient } = require('@prisma/client');

async function testBuscaRegiao() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testando busca por região com diferentes variações...');
    
    const termosTeste = [
      'brasilia',
      'brasília', 
      'BRASILIA',
      'BRASÍLIA',
      'sao paulo',
      'são paulo',
      'SAO PAULO',
      'SÃO PAULO',
      'campinas',
      'CAMPINAS',
      'atibaia',
      'ATIBAIA'
    ];
    
    for (const termo of termosTeste) {
      console.log(`\n🔍 Testando busca por: "${termo}"`);
      
      const query = `
        SELECT DISTINCT p.id, p.nome, p.cidade, p.estado, p.bairro
        FROM "Prestador" p
        LEFT JOIN "RegiaoPrestador" r ON r."prestadorId" = p.id
        WHERE (
          unaccent(lower(COALESCE(p.bairro, ''))) LIKE unaccent(lower($1))
          OR unaccent(lower(COALESCE(p.cidade, ''))) LIKE unaccent(lower($1))
          OR unaccent(lower(COALESCE(p.estado, ''))) LIKE unaccent(lower($1))
          OR unaccent(lower(COALESCE(r.regiao, ''))) LIKE unaccent(lower($1))
        )
        ORDER BY p.nome ASC
        LIMIT 5
      `;
      
      const likeValue = `%${termo}%`;
      
      try {
        const resultados = await prisma.$queryRawUnsafe(query, likeValue);
        console.log(`✅ Encontrados ${resultados.length} prestadores para "${termo}":`);
        
        resultados.forEach((p) => {
          console.log(`   - ${p.nome} (${p.cidade || 'N/A'}, ${p.estado || 'N/A'})`);
        });
        
        if (resultados.length === 0) {
          console.log(`   ⚠️  Nenhum resultado encontrado para "${termo}"`);
        }
      } catch (error) {
        console.error(`❌ Erro ao buscar "${termo}":`, error.message);
      }
    }
    
    console.log('\n🎉 Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBuscaRegiao(); 