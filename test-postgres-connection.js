const { Client } = require('pg');

async function testPostgresConnection() {
  const config = {
    host: 'segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: '%t%E6G_$',
    database: 'segtrackdb',
    connectionTimeoutMillis: 10000, // 10 segundos
    query_timeout: 10000
  };

  console.log('Tentando conectar com as configurações:', {
    ...config,
    password: '****' // ocultando a senha no log
  });

  const client = new Client(config);

  try {
    console.log('Iniciando conexão...');
    await client.connect();
    
    console.log('✅ Conexão bem-sucedida');
    
    // Testando uma query simples
    console.log('Testando query simples...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Query executada com sucesso:', result.rows[0]);
    
    await client.end();
    console.log('Conexão encerrada com sucesso!');
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    console.error('Detalhes do erro:', {
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position
    });
  }
}

testPostgresConnection(); 