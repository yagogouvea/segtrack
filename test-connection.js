const mysql = require('mysql2/promise');

async function testConnection() {
  const config = {
    host: 'segtrackbd.cyv2oismclv3.us-east-1.rds.amazonaws.com',
    user: 'segtrac123',
    password: '3500817Ya',
    database: 'segtrack',
    connectTimeout: 10000, // 10 segundos
    debug: true
  };

  console.log('Tentando conectar com as configurações:', {
    ...config,
    password: '****' // ocultando a senha no log
  });

  try {
    console.log('Iniciando conexão...');
    const connection = await mysql.createConnection(config);
    
    console.log('Conexão estabelecida! Testando query simples...');
    const [rows] = await connection.execute('SELECT 1');
    console.log('Query executada com sucesso:', rows);
    
    await connection.end();
    console.log('Conexão encerrada com sucesso!');
  } catch (error) {
    console.error('Erro detalhado ao conectar:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
  }
}

testConnection(); 