const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('🔍 DIAGNÓSTICO DE CONEXÃO - BACKEND');
console.log('=====================================');

// 1. Verificar variáveis de ambiente
console.log('\n📋 VARIÁVEIS DE AMBIENTE:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NÃO DEFINIDA');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'DEFINIDA' : 'NÃO DEFINIDA');
console.log('BASE_URL:', process.env.BASE_URL || 'NÃO DEFINIDA');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NÃO DEFINIDA');

if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL (primeiros 50 chars):', process.env.DATABASE_URL.substring(0, 50) + '...');
}

// 2. Testar conexão com Prisma
async function testPrismaConnection() {
  console.log('\n🔗 TESTANDO CONEXÃO PRISMA:');
  
  try {
    const prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });

    console.log('✅ Prisma Client criado com sucesso');
    
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
    
    // Testar query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query de teste executada:', result);
    
    // Testar contagem de tabelas principais
    try {
      const clientesCount = await prisma.cliente.count();
      console.log('✅ Clientes na base:', clientesCount);
    } catch (e) {
      console.log('❌ Erro ao contar clientes:', e.message);
    }
    
    try {
      const prestadoresCount = await prisma.prestador.count();
      console.log('✅ Prestadores na base:', prestadoresCount);
    } catch (e) {
      console.log('❌ Erro ao contar prestadores:', e.message);
    }
    
    try {
      const ocorrenciasCount = await prisma.ocorrencia.count();
      console.log('✅ Ocorrências na base:', ocorrenciasCount);
    } catch (e) {
      console.log('❌ Erro ao contar ocorrências:', e.message);
    }
    
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco');
    
  } catch (error) {
    console.error('❌ ERRO NA CONEXÃO PRISMA:', error);
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  }
}

// 3. Testar API endpoints
async function testApiEndpoints() {
  console.log('\n🌐 TESTANDO ENDPOINTS DA API:');
  
  const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
  const endpoints = [
    '/api/test',
    '/api/ocorrencias-test',
    '/api/fotos-test'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

// 4. Verificar configuração do servidor
function checkServerConfig() {
  console.log('\n⚙️ CONFIGURAÇÃO DO SERVIDOR:');
  console.log('Porta padrão:', process.env.PORT || 8080);
  console.log('Diretório atual:', process.cwd());
  console.log('Node version:', process.version);
  console.log('Platform:', process.platform);
}

// Executar diagnóstico
async function runDiagnostic() {
  checkServerConfig();
  await testPrismaConnection();
  await testApiEndpoints();
  
  console.log('\n📊 RESUMO DO DIAGNÓSTICO:');
  console.log('=====================================');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ CRÍTICO: DATABASE_URL não está definida');
  } else {
    console.log('✅ DATABASE_URL está configurada');
  }
  
  if (!process.env.JWT_SECRET) {
    console.log('❌ CRÍTICO: JWT_SECRET não está definida');
  } else {
    console.log('✅ JWT_SECRET está configurada');
  }
  
  console.log('\n🔧 PRÓXIMOS PASSOS:');
  console.log('1. Se DATABASE_URL não está definida, verifique o arquivo .env');
  console.log('2. Se JWT_SECRET não está definida, gere uma nova chave');
  console.log('3. Se a conexão falha, verifique se o banco está acessível');
  console.log('4. Se os endpoints falham, verifique se o servidor está rodando');
}

runDiagnostic().catch(console.error); 