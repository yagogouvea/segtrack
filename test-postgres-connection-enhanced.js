const { Client } = require('pg');

async function testPostgresConnection() {
  const config = {
    host: 'segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: '%t%E6G_$',
    database: 'segtrackdb',
    connectionTimeoutMillis: 30000, // Aumentado para 30 segundos
    query_timeout: 30000,
    statement_timeout: 30000,
    idle_timeout: 30000,
    // Configurações adicionais para debug
    ssl: false, // Tente false primeiro
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
  };

  console.log('🔍 Teste de Conexão PostgreSQL - AWS RDS');
  console.log('==========================================');
  console.log('Configurações de conexão:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
    connectionTimeoutMillis: config.connectionTimeoutMillis,
    ssl: config.ssl
  });

  const client = new Client(config);

  try {
    console.log('\n📡 Iniciando conexão...');
    console.log('⏱️  Timeout configurado: 30 segundos');
    
    const startTime = Date.now();
    await client.connect();
    const endTime = Date.now();
    
    console.log(`✅ Conexão bem-sucedida em ${endTime - startTime}ms`);
    
    // Testando uma query simples
    console.log('\n🔍 Testando query simples...');
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query executada com sucesso:');
    console.log(`   - Data/Hora atual: ${result.rows[0].current_time}`);
    console.log(`   - Versão PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]}`);
    
    // Testando informações do banco
    console.log('\n🔍 Testando informações do banco...');
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `);
    console.log('✅ Informações do banco:');
    console.log(`   - Banco: ${dbInfo.rows[0].database_name}`);
    console.log(`   - Usuário: ${dbInfo.rows[0].current_user}`);
    console.log(`   - Endereço do servidor: ${dbInfo.rows[0].server_address}`);
    console.log(`   - Porta do servidor: ${dbInfo.rows[0].server_port}`);
    
    await client.end();
    console.log('\n✅ Conexão encerrada com sucesso!');
    console.log('\n🎉 Teste concluído - Banco PostgreSQL acessível!');
    
  } catch (error) {
    console.error('\n❌ Erro de conexão:', error.message);
    console.error('\n🔍 Detalhes do erro:');
    console.error(`   - Código: ${error.code || 'N/A'}`);
    console.error(`   - Tipo: ${error.constructor.name}`);
    console.error(`   - Stack: ${error.stack ? error.stack.split('\n')[1] : 'N/A'}`);
    
    // Sugestões baseadas no tipo de erro
    console.log('\n💡 Sugestões de solução:');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   - Verificar se o RDS está rodando');
      console.log('   - Verificar se a porta 5432 está aberta no Security Group');
      console.log('   - Verificar se o IP de origem está liberado');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   - Verificar se o hostname está correto');
      console.log('   - Verificar conectividade de rede');
    } else if (error.message.includes('timeout')) {
      console.log('   - Verificar conectividade de rede');
      console.log('   - Verificar se o RDS está acessível');
      console.log('   - Tentar com SSL habilitado');
    } else if (error.message.includes('password authentication failed')) {
      console.log('   - Verificar usuário e senha');
      console.log('   - Verificar se o usuário tem permissão de acesso');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('   - Verificar se o nome do banco está correto');
      console.log('   - Verificar se o banco foi criado');
    }
    
    console.log('\n🔧 Para mais diagnósticos, execute:');
    console.log('   - ping segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com');
    console.log('   - telnet segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com 5432');
  }
}

// Função para testar conectividade básica
async function testBasicConnectivity() {
  console.log('\n🌐 Testando conectividade básica...');
  
  try {
    const dns = require('dns').promises;
    const addresses = await dns.resolve4('segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com');
    console.log(`✅ DNS resolvido: ${addresses.join(', ')}`);
  } catch (error) {
    console.log(`❌ Erro DNS: ${error.message}`);
  }
}

// Executar testes
async function runTests() {
  await testBasicConnectivity();
  await testPostgresConnection();
}

runTests(); 