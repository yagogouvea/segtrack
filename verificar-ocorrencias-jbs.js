const { PrismaClient } = require('@prisma/client');
const { remove: removeDiacritics } = require('diacritics');

const prisma = new PrismaClient();

async function verificarOcorrenciasJBS() {
  console.log('🔍 Verificando ocorrências do cliente JBS no banco de dados...\n');

  try {
    // 1. Buscar todas as ocorrências
    console.log('1️⃣ Buscando todas as ocorrências...');
    const todasOcorrencias = await prisma.ocorrencia.findMany({
      orderBy: { criado_em: 'desc' },
      select: {
        id: true,
        placa1: true,
        cliente: true,
        status: true,
        tipo: true,
        criado_em: true
      }
    });

    console.log(`📊 Total de ocorrências no banco: ${todasOcorrencias.length}`);

    // 2. Mostrar todas as ocorrências com cliente JBS
    console.log('\n2️⃣ Ocorrências com cliente "JBS":');
    const ocorrenciasJBS = todasOcorrencias.filter(o => 
      o.cliente && o.cliente.toLowerCase().includes('jbs')
    );

    console.log(`📋 Encontradas ${ocorrenciasJBS.length} ocorrências com "JBS":`);
    ocorrenciasJBS.forEach((ocorrencia, index) => {
      console.log(`${index + 1}. ID: ${ocorrencia.id}`);
      console.log(`   Placa: ${ocorrencia.placa1}`);
      console.log(`   Cliente: "${ocorrencia.cliente}"`);
      console.log(`   Status: ${ocorrencia.status}`);
      console.log(`   Tipo: ${ocorrencia.tipo}`);
      console.log(`   Criado em: ${ocorrencia.criado_em}`);
      console.log('');
    });

    // 3. Testar normalização
    console.log('3️⃣ Testando normalização de nomes...');
    const nomesUnicos = [...new Set(todasOcorrencias.map(o => o.cliente).filter(Boolean))];
    
    console.log('📝 Nomes únicos de clientes encontrados:');
    nomesUnicos.forEach(nome => {
      const normalizado = removeDiacritics(nome).toLowerCase().replace(/\s+/g, '');
      console.log(`   "${nome}" -> "${normalizado}"`);
    });

    // 4. Verificar ocorrências em andamento
    console.log('\n4️⃣ Ocorrências em andamento:');
    const emAndamento = todasOcorrencias.filter(o => o.status === 'em_andamento');
    console.log(`📊 Total em andamento: ${emAndamento.length}`);
    
    emAndamento.forEach((ocorrencia, index) => {
      console.log(`${index + 1}. ID: ${ocorrencia.id}`);
      console.log(`   Placa: ${ocorrencia.placa1}`);
      console.log(`   Cliente: "${ocorrencia.cliente}"`);
      console.log(`   Tipo: ${ocorrencia.tipo}`);
      console.log(`   Criado em: ${ocorrencia.criado_em}`);
      console.log('');
    });

    // 5. Verificar ocorrências em andamento do JBS
    console.log('5️⃣ Ocorrências em andamento do JBS:');
    const jbsEmAndamento = emAndamento.filter(o => 
      o.cliente && o.cliente.toLowerCase().includes('jbs')
    );
    
    console.log(`📊 JBS em andamento: ${jbsEmAndamento.length}`);
    jbsEmAndamento.forEach((ocorrencia, index) => {
      console.log(`${index + 1}. ID: ${ocorrencia.id}`);
      console.log(`   Placa: ${ocorrencia.placa1}`);
      console.log(`   Cliente: "${ocorrencia.cliente}"`);
      console.log(`   Tipo: ${ocorrencia.tipo}`);
      console.log(`   Criado em: ${ocorrencia.criado_em}`);
      console.log('');
    });

    // 6. Verificar dados do cliente JBS na tabela de clientes
    console.log('6️⃣ Verificando dados do cliente JBS na tabela de clientes...');
    const clienteJBS = await prisma.cliente.findFirst({
      where: {
        OR: [
          { nome: { contains: 'JBS', mode: 'insensitive' } },
          { nome_fantasia: { contains: 'JBS', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        nome: true,
        nome_fantasia: true,
        cnpj: true
      }
    });

    if (clienteJBS) {
      console.log('✅ Cliente JBS encontrado na tabela de clientes:');
      console.log(`   ID: ${clienteJBS.id}`);
      console.log(`   Nome: "${clienteJBS.nome}"`);
      console.log(`   Nome Fantasia: "${clienteJBS.nome_fantasia}"`);
      console.log(`   CNPJ: ${clienteJBS.cnpj}`);
    } else {
      console.log('❌ Cliente JBS não encontrado na tabela de clientes');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar ocorrências:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a verificação
verificarOcorrenciasJBS(); 