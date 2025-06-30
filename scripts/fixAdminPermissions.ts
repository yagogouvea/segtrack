import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adminEmail = 'admin@segtrack.com';

const adminPermissions = [
  // Permissões para user
  'create:user',
  'read:user', 
  'update:user',
  'delete:user',
  
  // Permissões para cliente
  'create:cliente',
  'read:cliente',
  'update:cliente', 
  'delete:cliente',
  
  // Permissões para ocorrencia
  'create:ocorrencia',
  'read:ocorrencia',
  'update:ocorrencia',
  'delete:ocorrencia',
  
  // Permissões para prestador
  'create:prestador',
  'read:prestador',
  'update:prestador',
  'delete:prestador',
  
  // Permissões para relatorio
  'create:relatorio',
  'read:relatorio',
  'update:relatorio',
  'delete:relatorio',
  
  // Permissões para contrato
  'create:contrato',
  'read:contrato',
  'update:contrato',
  'delete:contrato',
  
  // Permissão para dashboard
  'read:dashboard',
  
  // Permissões para foto
  'upload:foto',
  'create:foto',
  'read:foto',
  'update:foto',
  'delete:foto'
];

async function fixAdminPermissions() {
  try {
    console.log('🔍 Verificando usuário admin...');
    
    const user = await prisma.user.findUnique({ 
      where: { email: adminEmail } 
    });
    
    if (!user) {
      console.log(`❌ Usuário não encontrado: ${adminEmail}`);
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${user.name} (${user.email})`);
    console.log(`📋 Permissões atuais:`, user.permissions);
    
    // Atualizar permissões
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        permissions: adminPermissions,
        role: 'admin',
        active: true
      }
    });
    
    console.log('✅ Permissões atualizadas com sucesso!');
    console.log(`📋 Novas permissões:`, updatedUser.permissions);
    console.log(`👤 Usuário: ${updatedUser.name} (${updatedUser.email})`);
    console.log(`🔑 Role: ${updatedUser.role}`);
    console.log(`🟢 Status: ${updatedUser.active ? 'Ativo' : 'Inativo'}`);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar permissões do admin:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão com banco de dados fechada');
  }
}

// Executar o script
fixAdminPermissions(); 