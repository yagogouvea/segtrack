import prisma from '../lib/db';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Define as permissões como um objeto e converte para JSON string
    const permissions = JSON.stringify({
      users: {
        create: true,
        read: true,
        update: true,
        delete: true
      },
      ocorrencias: {
        create: true,
        read: true,
        update: true,
        delete: true
      }
    });

    const user = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@segtrack.com',
        passwordHash: hashedPassword,
        role: 'admin',
        permissions,
        active: true
      }
    });

    console.log('Admin user created:', user);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 