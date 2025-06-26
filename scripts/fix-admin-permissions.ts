import { prisma } from '../src/lib/db';

async function fixAdminPermissions() {
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

  await prisma.user.update({
    where: { email: 'admin@segtrack.com.br' },
    data: { permissions: JSON.stringify(permissions) }
  });

  console.log('✅ Permissões do admin corrigidas!');
  await prisma.$disconnect();
}

fixAdminPermissions(); 