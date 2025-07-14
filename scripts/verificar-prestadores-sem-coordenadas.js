const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando prestadores sem coordenadas válidas...');
  const prestadores = await prisma.prestador.findMany({
    select: {
      id: true,
      nome: true,
      cidade: true,
      estado: true,
      endereco: true,
      latitude: true,
      longitude: true
    }
  });

  const semCoordenadas = prestadores.filter(p => {
    const lat = p.latitude;
    const lon = p.longitude;
    return (
      lat === null || lon === null ||
      typeof lat !== 'number' || typeof lon !== 'number' ||
      lat === 0 || lon === 0 ||
      isNaN(lat) || isNaN(lon)
    );
  });

  console.log(`\n📊 Total de prestadores: ${prestadores.length}`);
  console.log(`❌ Prestadores sem coordenadas válidas: ${semCoordenadas.length}`);

  if (semCoordenadas.length > 0) {
    console.log('\nLista de prestadores sem coordenadas:');
    semCoordenadas.forEach(p => {
      console.log(`- ID: ${p.id} | Nome: ${p.nome} | Cidade: ${p.cidade} | Estado: ${p.estado} | Endereço: ${p.endereco} | Latitude: ${p.latitude} | Longitude: ${p.longitude}`);
    });
  } else {
    console.log('✅ Todos os prestadores possuem coordenadas válidas!');
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 