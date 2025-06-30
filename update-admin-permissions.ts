import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Todas as permissões necessárias para admin
const adminPermissions = [
  // Usuários
  'create:user',
  'read:user',
  'update:user',
  'delete:user',
  
  // Clientes
  'create:client',
  'read:client',
  'update:client',
  'delete:client',
  
  // Ocorrências
  'create:ocorrencia',
  'read:ocorrencia',
  'update:ocorrencia',
  'delete:ocorrencia',
  
  // Prestadores
  'create:prestador',
  'read:prestador',
  'update:prestador',
  'delete:prestador',
  
  // Relatórios
  'create:relatorio',
  'read:relatorio',
  'update:relatorio',
  'delete:relatorio',
  
  // Contratos
  'create:contrato',
  'read:contrato',
  'update:contrato',
  'delete:contrato',
  
  // Dashboard
  'read:dashboard',
  
  // Fotos
  'upload:foto',
  'create:foto',
  'read:foto',
  'update:foto',
  'delete:foto',
  
  // Veículos
  'create:veiculo',
  'read:veiculo',
  'update:veiculo',
  'delete:veiculo',
  
  // Financeiro
  'read:financeiro',
  'update:financeiro',
  
  // Configurações
  'read:config',
  'update:config'
];

async function updateAdminPermissions() {
  try {
    console.log('🔄 Atualizando permissões do admin...');
    
    // Buscar o usuário admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@segtrack.com' }
    });

    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }

    console.log('👤 Admin encontrado:', adminUser.name);
    console.log('📋 Permissões atuais:', adminUser.permissions);
    console.log('📋 Novas permissões:', adminPermissions);
    console.log(`📊 Total de permissões: ${adminPermissions.length}`);

    // Atualizar permissões
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        permissions: adminPermissions
      }
    });

    console.log('✅ Permissões do admin atualizadas com sucesso!');

    // Verificar resultado
    const updatedAdmin = await prisma.user.findUnique({
      where: { id: adminUser.id },
      select: {
        name: true,
        email: true,
        role: true,
        permissions: true
      }
    });

    console.log('\n🔍 Resultado da atualização:');
    console.log('Nome:', updatedAdmin?.name);
    console.log('Email:', updatedAdmin?.email);
    console.log('Role:', updatedAdmin?.role);
    console.log('Permissões:', updatedAdmin?.permissions);
    console.log(`Total de permissões: ${Array.isArray(updatedAdmin?.permissions) ? updatedAdmin.permissions.length : 'N/A'}`);

  } catch (error) {
    console.error('❌ Erro ao atualizar permissões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPermissions(); 