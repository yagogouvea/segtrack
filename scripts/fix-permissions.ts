import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeamento de permissões antigas para o novo padrão
const permissionMap: Record<string, string> = {
  'dashboard': 'read:dashboard',
  'prestadores': 'read:prestador',
  'prestadores:adicionar': 'create:prestador',
  'prestadores:editar': 'update:prestador',
  'prestadores:excluir': 'delete:prestador',
  'clientes': 'read:cliente',
  'clientes:adicionar': 'create:cliente',
  'clientes:editar': 'update:cliente',
  'clientes:excluir': 'delete:cliente',
  'relatorios': 'read:relatorio',
  'relatorios:baixar': 'read:relatorio',
  'relatorios:editar': 'update:relatorio',
  'usuarios': 'read:user',
};

function convertPermissions(perms: string[]): string[] {
  return perms
    .map(p => permissionMap[p] || p)
    .filter((v, i, arr) => !!v && arr.indexOf(v) === i); // remove duplicados e falsy
}

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    let perms: string[] = [];
    try {
      let raw = user.permissions;
      if (typeof raw === 'string') {
        perms = JSON.parse(raw);
      } else if (Array.isArray(raw)) {
        perms = raw;
      } else {
        perms = [];
      }
      if (!Array.isArray(perms)) perms = [];
    } catch {
      perms = [];
    }
    const newPerms = convertPermissions(perms);
    if (JSON.stringify(perms) !== JSON.stringify(newPerms)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { permissions: JSON.stringify(newPerms) }
      });
      console.log(`Usuário ${user.email} atualizado:`, newPerms);
    }
  }
  await prisma.$disconnect();
  console.log('Permissões corrigidas!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 