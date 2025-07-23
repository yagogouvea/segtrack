const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarOcorrenciasEmAndamento() {
  try {
    console.log('🔍 Testando ocorrências em andamento...\n');

    // 1. Buscar todas as ocorrências
    const todasOcorrencias = await prisma.ocorrencia.findMany({
      select: {
        id: true,
        placa1: true,
        cliente: true,
        status: true,
        resultado: true,
        criado_em: true,
        tipo: true,
        prestador: true
      },
      orderBy: {
        criado_em: 'desc'
      }
    });

    console.log(`📊 Total de ocorrências no banco: ${todasOcorrencias.length}\n`);

    // 2. Contar por status
    const contagemPorStatus = {};
    todasOcorrencias.forEach(oc => {
      const status = oc.status || 'sem_status';
      contagemPorStatus[status] = (contagemPorStatus[status] || 0) + 1;
    });

    console.log('📈 Contagem por status:');
    Object.entries(contagemPorStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // 3. Filtrar ocorrências em andamento (aguardando ou em_andamento)
    const emAndamento = todasOcorrencias.filter(oc => {
      const status = (oc.status || '').toLowerCase();
      return status === 'aguardando' || status === 'em_andamento';
    });

    console.log(`\n✅ Ocorrências em andamento (aguardando + em_andamento): ${emAndamento.length}`);

    // 4. Mostrar detalhes das ocorrências em andamento
    if (emAndamento.length > 0) {
      console.log('\n📋 Detalhes das ocorrências em andamento:');
      emAndamento.forEach((oc, index) => {
        console.log(`  ${index + 1}. ID: ${oc.id} | Placa: ${oc.placa1} | Cliente: ${oc.cliente} | Status: ${oc.status} | Tipo: ${oc.tipo} | Prestador: ${oc.prestador || 'N/A'}`);
      });
    }

    // 5. Verificar ocorrências do mês atual
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    const ocorrenciasMes = todasOcorrencias.filter(oc => {
      const dataCriacao = new Date(oc.criado_em);
      const status = (oc.status || '').toLowerCase();
      return dataCriacao >= inicioMes && status !== 'cancelada';
    });

    console.log(`\n📅 Ocorrências do mês atual (exceto canceladas): ${ocorrenciasMes.length}`);

    // 6. Verificar ocorrências recuperadas no mês
    const recuperadasMes = todasOcorrencias.filter(oc => {
      const dataCriacao = new Date(oc.criado_em);
      const resultado = (oc.resultado || '').toLowerCase();
      return dataCriacao >= inicioMes && resultado === 'recuperado';
    });

    console.log(`✅ Ocorrências recuperadas no mês: ${recuperadasMes.length}`);

    // 7. Verificar se há problemas de case sensitivity
    console.log('\n🔍 Verificando problemas de case sensitivity:');
    const statusUnicos = [...new Set(todasOcorrencias.map(oc => oc.status))];
    console.log('Status únicos encontrados:', statusUnicos);

    const resultadosUnicos = [...new Set(todasOcorrencias.map(oc => oc.resultado).filter(Boolean))];
    console.log('Resultados únicos encontrados:', resultadosUnicos);

  } catch (error) {
    console.error('❌ Erro ao testar ocorrências:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarOcorrenciasEmAndamento(); 