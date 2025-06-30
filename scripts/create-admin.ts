import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminData = {
      name: 'Administrador',
      email: 'admin@segtrack.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: UserRole.admin,
      permissions: [
        'create:user',
        'read:user', 
        'update:user',
        'delete:user',
        'create:client',
        'read:client',
        'update:client', 
        'delete:client',
        'create:ocorrencia',
        'read:ocorrencia',
        'update:ocorrencia',
        'delete:ocorrencia',
        'create:prestador',
        'read:prestador',
        'update:prestador',
        'delete:prestador',
        'create:relatorio',
        'read:relatorio',
        'update:relatorio',
        'delete:relatorio',
        'create:contrato',
        'read:contrato',
        'update:contrato',
        'delete:contrato',
        'read:dashboard',
        'upload:foto',
        'create:foto',
        'read:foto',
        'update:foto',
        'delete:foto'
      ],
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