const { Client } = require('pg');

async function testPostgresWithSSL() {
  const config = {
    host: 'segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: '%t%E6G_$',
    database: 'segtrackdb',
    connectionTimeoutMillis: 30000,
    query_timeout: 30000,
    // Configurações SSL para AWS RDS
    ssl: {
      rejectUnauthorized: false, // Permite certificados auto-assinados
      ca: undefined,
      key: undefined,
      cert: undefined
    }
  };

  console.log('🔍 Teste de Conexão PostgreSQL com SSL - AWS RDS');
  console.log('================================================');
  console.log('Configurações de conexão:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
    ssl: 'habilitado com rejectUnauthorized: false'
  });

  const client = new Client(config);

  try {
    console.log('\n📡 Iniciando conexão com SSL...');
    console.log('⏱️  Timeout configurado: 30 segundos');
    
    const startTime = Date.now();
    await client.connect();
    const endTime = Date.now();
    
    console.log(`✅ Conexão SSL bem-sucedida em ${endTime - startTime}ms`);
    
    // Testando uma query simples
    console.log('\n🔍 Testando query simples...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query executada com sucesso:', result.rows[0]);
    
    await client.end();
    console.log('\n✅ Conexão SSL encerrada com sucesso!');
    console.log('\n🎉 Teste SSL concluído - Banco PostgreSQL acessível via SSL!');
    
  } catch (error) {
    console.error('\n❌ Erro de conexão SSL:', error.message);
    console.error('\n🔍 Detalhes do erro:');
    console.error(`   - Código: ${error.code || 'N/A'}`);
    console.error(`   - Tipo: ${error.constructor.name}`);
    
    if (error.message.includes('SSL')) {
      console.log('\n💡 Tentando sem SSL...');
      await testPostgresWithoutSSL();
    }
  }
}

async function testPostgresWithoutSSL() {
  const config = {
    host: 'segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: '%t%E6G_$',
    database: 'segtrackdb',
    connectionTimeoutMillis: 30000,
    ssl: false
  };

  const client = new Client(config);

  try {
    console.log('\n📡 Tentando conexão sem SSL...');
    await client.connect();
    console.log('✅ Conexão sem SSL bem-sucedida!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query executada com sucesso:', result.rows[0]);
    
    await client.end();
    console.log('\n🎉 Conexão sem SSL funcionou!');
    
  } catch (error) {
    console.error('\n❌ Erro de conexão sem SSL:', error.message);
    console.log('\n🔧 Verificações necessárias:');
    console.log('   1. Verificar se o RDS está rodando');
    console.log('   2. Verificar Security Group (porta 5432)');
    console.log('   3. Verificar se o IP está liberado');
    console.log('   4. Verificar credenciais');
  }
}

testPostgresWithSSL(); 