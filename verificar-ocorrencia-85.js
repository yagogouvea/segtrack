const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarOcorrencia85() {
  console.log('🔍 Verificando ocorrência ID 85 no banco de dados...\n');

  try {
    // 1. Verificar se a ocorrência 85 existe
    console.log('1️⃣ Buscando ocorrência ID 85...');
    const ocorrencia = await prisma.ocorrencia.findUnique({
      where: { id: 85 },
      include: {
        fotos: true
      }
    });

    if (ocorrencia) {
      console.log('✅ Ocorrência 85 encontrada:');
      console.log(`   ID: ${ocorrencia.id}`);
      console.log(`   Placa: ${ocorrencia.placa1}`);
      console.log(`   Cliente: "${ocorrencia.cliente}"`);
      console.log(`   Tipo: ${ocorrencia.tipo}`);
      console.log(`   Status: ${ocorrencia.status}`);
      console.log(`   Criado em: ${ocorrencia.criado_em}`);
      console.log(`   KM: ${ocorrencia.km}`);
      console.log(`   KM Inicial: ${ocorrencia.km_inicial}`);
      console.log(`   KM Final: ${ocorrencia.km_final}`);
      console.log(`   Fotos: ${ocorrencia.fotos.length}`);
    } else {
      console.log('❌ Ocorrência 85 NÃO encontrada!');
    }

    // 2. Verificar todas as ocorrências para entender a sequência
    console.log('\n2️⃣ Verificando todas as ocorrências...');
    const todasOcorrencias = await prisma.ocorrencia.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        placa1: true,
        cliente: true,
        status: true,
        criado_em: true
      }
    });

    console.log(`📊 Total de ocorrências no banco: ${todasOcorrencias.length}`);

    if (todasOcorrencias.length > 0) {
      console.log('📋 IDs das ocorrências existentes:');
      const ids = todasOcorrencias.map(o => o.id);
      console.log(`   ${ids.join(', ')}`);
      
      // Verificar se há gaps na sequência
      const maxId = Math.max(...ids);
      const missingIds = [];
      for (let i = 1; i <= maxId; i++) {
        if (!ids.includes(i)) {
          missingIds.push(i);
        }
      }
      
      if (missingIds.length > 0) {
        console.log(`⚠️ IDs ausentes na sequência: ${missingIds.join(', ')}`);
      }
    }

    // 3. Verificar ocorrências próximas ao ID 85
    console.log('\n3️⃣ Verificando ocorrências próximas ao ID 85...');
    const ocorrenciasProximas = await prisma.ocorrencia.findMany({
      where: {
        id: {
          gte: 80,
          lte: 90
        }
      },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        placa1: true,
        cliente: true,
        status: true,
        criado_em: true
      }
    });

    console.log(`📋 Ocorrências entre ID 80-90:`);
    ocorrenciasProximas.forEach(oc => {
      console.log(`   ID ${oc.id}: ${oc.placa1} - ${oc.cliente} (${oc.status})`);
    });

    // 4. Verificar se há problemas de conexão
    console.log('\n4️⃣ Testando conexão com banco...');
    try {
      const testResult = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Conexão com banco OK');
    } catch (error) {
      console.log('❌ Erro na conexão com banco:', error.message);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar ocorrência:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarOcorrencia85(); 