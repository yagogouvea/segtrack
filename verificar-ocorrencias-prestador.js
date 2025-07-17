const { PrismaClient } = require('@prisma/client');

async function verificarOcorrenciasPrestador() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando ocorrências do prestador...');
    
    // Buscar o prestador Yago Gouvea
    const prestador = await prisma.prestador.findFirst({
      where: { 
        nome: 'Yago Gouvea'
      }
    });
    
    if (!prestador) {
      console.log('❌ Prestador Yago Gouvea não encontrado');
      return;
    }
    
    console.log('✅ Prestador encontrado:');
    console.log(`- Nome: ${prestador.nome}`);
    console.log(`- ID: ${prestador.id}`);
    
    // Buscar todas as ocorrências
    const todasOcorrencias = await prisma.ocorrencia.findMany({
      select: {
        id: true,
        tipo: true,
        status: true,
        prestador: true,
        cliente: true,
        criado_em: true
      },
      orderBy: {
        criado_em: 'desc'
      },
      take: 10
    });
    
    console.log('\n📋 Últimas 10 ocorrências no sistema:');
    todasOcorrencias.forEach(oc => {
      console.log(`- ID: ${oc.id}, Tipo: ${oc.tipo}, Status: ${oc.status}, Prestador: ${oc.prestador || 'N/A'}, Cliente: ${oc.cliente}`);
    });
    
    // Buscar ocorrências vinculadas ao prestador
    const ocorrenciasPrestador = await prisma.ocorrencia.findMany({
      where: {
        prestador: prestador.nome,
        status: {
          in: ['em_andamento', 'aguardando']
        }
      },
      select: {
        id: true,
        tipo: true,
        status: true,
        prestador: true,
        cliente: true,
        criado_em: true
      },
      orderBy: {
        criado_em: 'desc'
      }
    });
    
    console.log(`\n📋 Ocorrências vinculadas ao prestador ${prestador.nome}:`);
    if (ocorrenciasPrestador.length === 0) {
      console.log('❌ Nenhuma ocorrência encontrada para este prestador');
      
      // Verificar se há ocorrências com status correto mas sem prestador
      const ocorrenciasSemPrestador = await prisma.ocorrencia.findMany({
        where: {
          prestador: null,
          status: {
            in: ['em_andamento', 'aguardando']
          }
        },
        select: {
          id: true,
          tipo: true,
          status: true,
          prestador: true,
          cliente: true,
          criado_em: true
        }
      });
      
      console.log(`\n📋 Ocorrências sem prestador atribuído (${ocorrenciasSemPrestador.length}):`);
      ocorrenciasSemPrestador.forEach(oc => {
        console.log(`- ID: ${oc.id}, Tipo: ${oc.tipo}, Status: ${oc.status}, Cliente: ${oc.cliente}`);
      });
    } else {
      ocorrenciasPrestador.forEach(oc => {
        console.log(`- ID: ${oc.id}, Tipo: ${oc.tipo}, Status: ${oc.status}, Cliente: ${oc.cliente}`);
      });
    }
    
    // Verificar se há ocorrências com o nome do prestador em diferentes formatos
    const ocorrenciasComNome = await prisma.ocorrencia.findMany({
      where: {
        prestador: {
          contains: prestador.nome
        }
      },
      select: {
        id: true,
        tipo: true,
        status: true,
        prestador: true,
        cliente: true,
        criado_em: true
      }
    });
    
    console.log(`\n📋 Ocorrências que contêm o nome do prestador (${ocorrenciasComNome.length}):`);
    ocorrenciasComNome.forEach(oc => {
      console.log(`- ID: ${oc.id}, Tipo: ${oc.tipo}, Status: ${oc.status}, Prestador: ${oc.prestador}, Cliente: ${oc.cliente}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarOcorrenciasPrestador(); 