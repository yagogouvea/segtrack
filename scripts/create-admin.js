const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminData = {
      name: 'Administrador',
      email: 'admin@segtrack.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'admin',
      permissions: JSON.stringify({
        users: ['create', 'read', 'update', 'delete'],
        clients: ['create', 'read', 'update', 'delete'],
        occurrences: ['create', 'read', 'update', 'delete'],
        providers: ['create', 'read', 'update', 'delete'],
        reports: ['create', 'read', 'update', 'delete'],
        contracts: ['create', 'read', 'update', 'delete']
      }),
      active: true,
      updatedAt: new Date()
    };

    const admin = await prisma.user.create({
      data: adminData
    });

    console.log('Usuário admin criado com sucesso:', {
      id: admin.id,
      name: admin.name,
      email: admin.email
    });
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 