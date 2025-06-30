import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    // Verificar se existe um usuário com email admin@segtrack.com
    const adminUser = await prisma.user.findUnique({
      where: {
        email: 'admin@segtrack.com'
      }
    });

    if (adminUser) {
      console.log('✅ Usuário admin encontrado:');
      console.log({
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        active: adminUser.active,
        createdAt: adminUser.createdAt
      });
    } else {
      console.log('❌ Usuário admin NÃO encontrado');
      console.log('Email procurado: admin@segtrack.com');
    }

    // Listar todos os usuários para debug
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true
      }
    });

    console.log('\n📋 Todos os usuários no banco:');
    if (allUsers.length === 0) {
      console.log('Nenhum usuário encontrado no banco de dados');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Ativo: ${user.active}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao verificar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser(); 