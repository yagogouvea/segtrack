import { prisma } from '../lib/db';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Define as permissões no novo formato
    const permissions = [
      'create:user',
      'read:user',
      'update:user',
      'delete:user',
      'create:ocorrencia',
      'read:ocorrencia',
      'update:ocorrencia',
      'delete:ocorrencia',
      'read:dashboard',
      'read:relatorio',
      'create:foto',
      'read:foto',
      'update:foto',
      'delete:foto',
      'upload:foto'
    ];

    const user = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@segtrack.com',
        passwordHash: hashedPassword,
        role: 'admin',
        permissions: JSON.stringify(permissions),
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