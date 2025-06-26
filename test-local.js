const http = require('http');

console.log('🧪 Testando servidor local...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('✅ Status:', res.statusCode);
  console.log('✅ Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ Response:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
  console.log('💡 Dica: Execute "npm run dev:compile" no backend primeiro');
  process.exit(1);
});

req.setTimeout(5000, () => {
  console.error('❌ Timeout: Servidor não respondeu em 5 segundos');
  console.log('💡 Dica: Execute "npm run dev:compile" no backend primeiro');
  process.exit(1);
});

req.end(); 