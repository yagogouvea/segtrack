import { prisma } from '../src/lib/db';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  const email = 'admin@segtrack.com.br';
  const password = 'segtrack123';
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

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Usuário admin já existe!');
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: 'Admin SEGTRACK',
      email,
      passwordHash,
      role: 'admin',
      permissions: JSON.stringify(permissions),
      active: true
    }
  });

  console.log('✅ Usuário admin criado com sucesso!');
  await prisma.$disconnect();
}

createAdminUser(); 