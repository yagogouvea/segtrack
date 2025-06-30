import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adminEmails = ['segtrack@admin.com', 'admin@segtrack.com'];

const allPermissions = [
  'create:user','read:user','update:user','delete:user',
  'create:client','read:client','update:client','delete:client',
  'create:ocorrencia','read:ocorrencia','update:ocorrencia','delete:ocorrencia',
  'create:prestador','read:prestador','update:prestador','delete:prestador',
  'create:relatorio','read:relatorio','update:relatorio','delete:relatorio',
  'create:contrato','read:contrato','update:contrato','delete:contrato',
  'read:dashboard','upload:foto','create:foto','read:foto','update:foto','delete:foto',
  'create:veiculo','read:veiculo','update:veiculo','delete:veiculo',
  'read:financeiro','update:financeiro','read:config','update:config'
];

async function fixAdminPermissions() {
  try {
    for (const email of adminEmails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.log(`Usuário não encontrado: ${email}`);
        continue;
      }
      await prisma.user.update({
        where: { email },
        data: {
          permissions: allPermissions,
          role: 'admin',
          active: true
        }
      });
      console.log(`Permissões do admin atualizadas para: ${email}`);
    }
  } catch (error) {
    console.error('Erro ao atualizar permissões do admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPermissions(); 