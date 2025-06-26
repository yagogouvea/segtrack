import { prisma } from '../lib/db';

async function updateUserPermissions() {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: 'yago@segtrackpr.com.br'
      }
    });

    if (!user) {
      console.error('❌ Usuário yago não encontrado');
      return;
    }

    const adminPermissions = {
      users: {
        read: true,
        create: true,
        update: true,
        delete: true
      },
      dashboard: {
        read: true
      },
      ocorrencias: {
        read: true,
        create: true,
        update: true,
        delete: true
      },
      prestadores: {
        read: true,
        create: true,
        update: true,
        delete: true
      },
      relatorios: {
        read: true,
        create: true
      },
      clientes: {
        read: true,
        create: true,
        update: true,
        delete: true
      }
    };

    await prisma.user.update({
      where: {
        email: 'yago@segtrackpr.com.br'
      },
      data: {
        role: 'admin',
        permissions: JSON.stringify(adminPermissions)
      }
    });

    console.log('✅ Permissões atualizadas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao atualizar permissões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPermissions(); 