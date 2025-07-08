const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addColumns() {
  try {
    console.log('Adicionando colunas na tabela Cliente...');
    
    await prisma.$executeRaw`
      ALTER TABLE "Cliente" 
      ADD COLUMN IF NOT EXISTS "bairro" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "cidade" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "estado" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "cep" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "nome_fantasia" VARCHAR(255);
    `;
    
    console.log('✅ Colunas adicionadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addColumns(); 