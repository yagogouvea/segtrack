const { Client } = require('pg');

console.log('🔍 DIAGNÓSTICO COMPLETO - CONEXÃO POSTGRESQL AWS RDS');
console.log('=====================================================');

const configs = [
  {
    name: 'Configuração 1: Sem SSL',
    config: {
      host: 'segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com',
      port: 5432,
      user: 'postgres',
      password: '%t%E6G_$',
      database: 'segtrackdb',
      connectionTimeoutMillis: 10000,
      ssl: false
    }
  },
  {
    name: 'Configuração 2: SSL com rejectUnauthorized: false',
    config: {
      host: 'segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com',
      port: 5432,
      user: 'postgres',
      password: '%t%E6G_$',
      database: 'segtrackdb',
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false
      }
    }
  },
  {
    name: 'Configuração 3: SSL com configuração completa',
    config: {
      host: 'segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com',
      port: 5432,
      user: 'postgres',
      password: '%t%E6G_$',
      database: 'segtrackdb',
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false,
        ca: undefined,
        key: undefined,
        cert: undefined
      }
    }
  },
  {
    name: 'Configuração 4: Timeout aumentado (30s)',
    config: {
      host: 'segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com',
      port: 5432,
      user: 'postgres',
      password: '%t%E6G_$',
      database: 'segtrackdb',
      connectionTimeoutMillis: 30000,
      ssl: false
    }
  }
];

async function testConfig(configInfo) {
  console.log(`\n📡 Testando: ${configInfo.name}`);
  console.log('─'.repeat(50));
  
  const client = new Client(configInfo.config);
  
  try {
    const startTime = Date.now();
    await client.connect();
    const endTime = Date.now();
    
    console.log(`✅ SUCESSO em ${endTime - startTime}ms`);
    
    // Teste rápido
    const result = await client.query('SELECT 1 as test');
    console.log(`   Query teste: ${result.rows[0].test}`);
    
    await client.end();
    return { success: true, time: endTime - startTime };
    
  } catch (error) {
    console.log(`❌ FALHA: ${error.message}`);
    console.log(`   Código: ${error.code || 'N/A'}`);
    return { success: false, error: error.message, code: error.code };
  }
}

async function testDNS() {
  console.log('\n🌐 Testando resolução DNS...');
  try {
    const dns = require('dns').promises;
    const addresses = await dns.resolve4('segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com');
    console.log(`✅ DNS resolvido: ${addresses.join(', ')}`);
    return true;
  } catch (error) {
    console.log(`❌ Erro DNS: ${error.message}`);
    return false;
  }
}

async function runDiagnostico() {
  console.log(`⏰ Iniciando diagnóstico em: ${new Date().toLocaleString()}`);
  
  // Teste DNS primeiro
  const dnsOk = await testDNS();
  
  if (!dnsOk) {
    console.log('\n⚠️  Problema de DNS detectado. Verifique conectividade de rede.');
    return;
  }
  
  // Testar todas as configurações
  const results = [];
  for (const configInfo of configs) {
    const result = await testConfig(configInfo);
    results.push({ ...result, name: configInfo.name });
  }
  
  // Resumo
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('====================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Sucessos: ${successful.length}/${results.length}`);
  console.log(`❌ Falhas: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 CONFIGURAÇÃO FUNCIONAL ENCONTRADA!');
    successful.forEach(result => {
      console.log(`   - ${result.name} (${result.time}ms)`);
    });
  } else {
    console.log('\n🔧 NENHUMA CONFIGURAÇÃO FUNCIONOU');
    console.log('\nVerificações necessárias:');
    console.log('   1. RDS está rodando?');
    console.log('   2. Security Group permite porta 5432?');
    console.log('   3. IP de origem está liberado?');
    console.log('   4. Credenciais estão corretas?');
    console.log('   5. Banco "segtrackdb" existe?');
  }
  
  console.log(`\n⏰ Diagnóstico concluído em: ${new Date().toLocaleString()}`);
}

runDiagnostico(); 