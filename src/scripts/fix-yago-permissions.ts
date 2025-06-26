import { prisma } from '../lib/prisma';

type UserPermissions = {
  users: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  ocorrencias: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  dashboard: {
    read: boolean;
  };
  prestadores: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  relatorios: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  clientes: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
};

async function fixYagoPermissions() {
  try {
    // Define admin permissions in the correct object format
    const adminPermissions: UserPermissions = {
      users: {
        read: true,
        create: true,
        update: true,
        delete: true
      },
      ocorrencias: {
        read: true,
        create: true,
        update: true,
        delete: true
      },
      dashboard: {
        read: true
      },
      prestadores: {
        read: true,
        create: true,
        update: true,
        delete: true
      },
      relatorios: {
        read: true,
        create: true,
        update: true,
        delete: true
      },
      clientes: {
        read: true,
        create: true,
        update: true,
        delete: true
      }
    };

    // Update Yago's permissions
    const updatedUser = await prisma.user.update({
      where: {
        email: 'yago@segtrackpr.com.br'
      },
      data: {
        role: 'admin',
        permissions: JSON.stringify(adminPermissions)
      }
    });

    console.log('✅ Permissões do usuário Yago atualizadas com sucesso:', {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      permissions: JSON.parse(updatedUser.permissions as string) as UserPermissions
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar permissões do Yago:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixYagoPermissions()
  .catch(console.error); 