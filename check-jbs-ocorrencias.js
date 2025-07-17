const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkJBSOcorrencias() {
  console.log('🔍 Verificando ocorrências do cliente JBS...');
  
  try {
    // 1. Verificar se o cliente JBS existe
    console.log('\n1️⃣ Verificando cliente JBS...');
    const clienteJBS = await prisma.cliente.findFirst({
      where: {
        OR: [
          { nome: { contains: 'JBS', mode: 'insensitive' } },
          { nome_fantasia: { contains: 'JBS', mode: 'insensitive' } },
          { cnpj: '02.916.265/0027-07' }
        ]
      }
    });

    if (clienteJBS) {
      console.log('✅ Cliente JBS encontrado:', {
        id: clienteJBS.id,
        nome: clienteJBS.nome,
        nome_fantasia: clienteJBS.nome_fantasia,
        cnpj: clienteJBS.cnpj
      });
    } else {
      console.log('❌ Cliente JBS não encontrado');
    }

    // 2. Verificar todas as ocorrências
    console.log('\n2️⃣ Verificando todas as ocorrências...');
    const todasOcorrencias = await prisma.ocorrencia.findMany({
      orderBy: { criado_em: 'desc' },
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
      console.log('📋 Primeiras 10 ocorrências:');
      todasOcorrencias.slice(0, 10).forEach((oc, index) => {
        console.log(`${index + 1}. ID: ${oc.id}, Placa: ${oc.placa1}, Cliente: "${oc.cliente}", Status: ${oc.status}`);
      });
    }

    // 3. Verificar ocorrências que contêm "JBS"
    console.log('\n3️⃣ Verificando ocorrências que contêm "JBS"...');
    const ocorrenciasJBS = todasOcorrencias.filter(o => 
      o.cliente && o.cliente.toLowerCase().includes('jbs')
    );

    console.log(`📊 Ocorrências que contêm "JBS": ${ocorrenciasJBS.length}`);

    if (ocorrenciasJBS.length > 0) {
      console.log('📋 Ocorrências do JBS:');
      ocorrenciasJBS.forEach((oc, index) => {
        console.log(`${index + 1}. ID: ${oc.id}, Placa: ${oc.placa1}, Cliente: "${oc.cliente}", Status: ${oc.status}`);
      });
    }

    // 4. Verificar diferentes variações do nome
    console.log('\n4️⃣ Verificando diferentes variações do nome...');
    const variacoes = ['JBS', 'JBS S/A', 'JBS SA', 'jbs', 'jbs s/a'];
    
    for (const variacao of variacoes) {
      const ocorrenciasVariacao = todasOcorrencias.filter(o => 
        o.cliente && o.cliente.toLowerCase().includes(variacao.toLowerCase())
      );
      console.log(`"${variacao}": ${ocorrenciasVariacao.length} ocorrências`);
    }

    // 5. Verificar se há ocorrências sem cliente
    console.log('\n5️⃣ Verificando ocorrências sem cliente...');
    const ocorrenciasSemCliente = todasOcorrencias.filter(o => !o.cliente || o.cliente.trim() === '');
    console.log(`Ocorrências sem cliente: ${ocorrenciasSemCliente.length}`);

    // 6. Testar normalização
    console.log('\n6️⃣ Testando normalização...');
    const { remove: removeDiacritics } = require('diacritics');
    
    const nomeJBS = 'JBS';
    const nomeNormalizado = removeDiacritics(nomeJBS).toLowerCase().replace(/\s+/g, '');
    console.log(`Nome original: "${nomeJBS}"`);
    console.log(`Nome normalizado: "${nomeNormalizado}"`);

    // Testar com ocorrências existentes
    if (todasOcorrencias.length > 0) {
      console.log('\n📋 Testando normalização com ocorrências existentes:');
      todasOcorrencias.slice(0, 5).forEach(oc => {
        if (oc.cliente) {
          const nomeOcorrenciaNormalizado = removeDiacritics(oc.cliente).toLowerCase().replace(/\s+/g, '');
          const match = nomeOcorrenciaNormalizado === nomeNormalizado;
          console.log(`"${oc.cliente}" -> "${nomeOcorrenciaNormalizado}" ${match ? '✅' : '❌'} "${nomeNormalizado}"`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar ocorrências:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJBSOcorrencias().catch(console.error); 