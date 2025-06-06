import { prisma } from '../lib/db';

async function fixYagoPermissions() {
  try {
    // Define admin permissions in the correct object format
    const adminPermissions = {
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
      permissions: updatedUser.permissions ? 
        JSON.parse(updatedUser.permissions as string) : 
        []
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar permissões do Yago:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixYagoPermissions(); 