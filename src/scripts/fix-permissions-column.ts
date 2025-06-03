import prisma from '../lib/db';

async function fixPermissionsColumn() {
  try {
    // Primeiro, atualiza os registros existentes que têm NULL para '[]'
    await prisma.$executeRaw`UPDATE User SET permissions = '[]' WHERE permissions IS NULL`;
    
    // Remove o valor padrão e altera o tipo para TEXT
    await prisma.$executeRaw`ALTER TABLE User ALTER COLUMN permissions DROP DEFAULT`;
    await prisma.$executeRaw`ALTER TABLE User MODIFY permissions TEXT NOT NULL`;
    
    console.log('✅ Coluna permissions atualizada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao atualizar coluna permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPermissionsColumn(); 