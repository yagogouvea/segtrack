const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando banco de dados SQLite para desenvolvimento...');

// 1. Copiar o schema SQLite
const schemaSqlitePath = path.join(__dirname, 'prisma', 'schema-sqlite.prisma');
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

if (fs.existsSync(schemaSqlitePath)) {
  fs.copyFileSync(schemaSqlitePath, schemaPath);
  console.log('✅ Schema SQLite copiado');
} else {
  console.error('❌ Arquivo schema-sqlite.prisma não encontrado');
  process.exit(1);
}

// 2. Gerar cliente Prisma
try {
  console.log('📦 Gerando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Cliente Prisma gerado');
} catch (error) {
  console.error('❌ Erro ao gerar cliente Prisma:', error.message);
  process.exit(1);
}

// 3. Criar banco de dados
try {
  console.log('🗄️ Criando banco de dados SQLite...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Banco de dados criado');
} catch (error) {
  console.error('❌ Erro ao criar banco de dados:', error.message);
  process.exit(1);
}

// 4. Criar dados de exemplo (opcional)
try {
  console.log('📝 Criando dados de exemplo...');
  execSync('npx tsx create-user.ts', { stdio: 'inherit' });
  console.log('✅ Dados de exemplo criados');
} catch (error) {
  console.log('⚠️ Erro ao criar dados de exemplo (pode ser ignorado):', error.message);
}

console.log('🎉 Configuração concluída!');
console.log('📋 Próximos passos:');
console.log('   1. Reinicie o servidor backend: npm run dev');
console.log('   2. Acesse o frontend em: http://localhost:3001'); 