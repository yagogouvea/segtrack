const { Client } = require('pg');

const databases = [
  {
    name: 'Railway (atual)',
    url: 'postgresql://postgres:BBIosMGvETUoYSvAVqqWnwcxUSDhFeTeq@shortline.proxy.rlwy.net:15684/railway'
  },
  {
    name: 'Railway (alternativo)',
    url: 'postgresql://postgres:BBIosMGvETUoYSvAVqqWnwcxUSDhFeTeq@tramway.proxy.rlwy.net:15957/railway'
  },
  {
    name: 'Local PostgreSQL',
    url: 'postgresql://segtrack_admin:3500@17V440g@127.0.0.1:5432/segtrack'
  }
];

async function testDatabase(name, url) {
  console.log(`\n🔍 Testando: ${name}`);
  console.log(`📡 URL: ${url.replace(/:[^:@]*@/, ':****@')}`);
  
  try {
    const client = new Client({ connectionString: url });
    await client.connect();
    console.log('✅ Conectado com sucesso!');
    await client.end();
    return true;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return false;
  }
}

async function testAllDatabases() {
  console.log('🧪 Testando diferentes configurações de banco...\n');
  
  for (const db of databases) {
    const success = await testDatabase(db.name, db.url);
    if (success) {
      console.log(`\n🎉 ${db.name} está funcionando!`);
      console.log(`💡 Use esta URL no seu .env:`);
      console.log(`DATABASE_URL="${db.url}"`);
      return db.url;
    }
  }
  
  console.log('\n❌ Nenhum banco de dados está acessível!');
  console.log('💡 Você precisa:');
  console.log('   1. Instalar PostgreSQL local');
  console.log('   2. Ou verificar o Railway Dashboard');
  console.log('   3. Ou usar outro provedor de banco');
  
  return null;
}

testAllDatabases(); 