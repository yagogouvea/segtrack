import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Todas as permissões necessárias para admin completo
const completeAdminPermissions = [
  // Usuários
  'create:user',
  'read:user',
  'update:user',
  'delete:user',
  
  // Clientes
  'create:cliente',
  'read:cliente',
  'update:cliente',
  'delete:cliente',
  
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

async function fixAllAdminPermissions() {
  try {
    console.log('🔄 Iniciando correção de permissões para todos os usuários admin...');
    console.log('===============================================================');
    
    // Buscar todos os usuários admin
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        active: true
      }
    });

    console.log(`📊 Encontrados ${adminUsers.length} usuários admin:`);
    adminUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Ativo: ${user.active ? 'Sim' : 'Não'}`);
    });

    if (adminUsers.length === 0) {
      console.log('❌ Nenhum usuário admin encontrado!');
      return;
    }

    // Atualizar permissões de cada admin
    for (const adminUser of adminUsers) {
      console.log(`\n🔧 Atualizando permissões para: ${adminUser.name} (${adminUser.email})`);
      console.log(`📋 Permissões atuais:`, adminUser.permissions);
      console.log(`📋 Novas permissões:`, completeAdminPermissions);
      console.log(`📊 Total de permissões: ${completeAdminPermissions.length}`);

      try {
        // Atualizar permissões
        await prisma.user.update({
          where: { id: adminUser.id },
          data: {
            permissions: completeAdminPermissions,
            role: 'admin',
            active: true
          }
        });

        console.log(`✅ Permissões atualizadas com sucesso para ${adminUser.name}!`);

        // Verificar resultado
        const updatedAdmin = await prisma.user.findUnique({
          where: { id: adminUser.id },
          select: {
            name: true,
            email: true,
            role: true,
            permissions: true,
            active: true
          }
        });

        console.log(`🔍 Resultado da atualização para ${adminUser.name}:`);
        console.log(`  Nome: ${updatedAdmin?.name}`);
        console.log(`  Email: ${updatedAdmin?.email}`);
        console.log(`  Role: ${updatedAdmin?.role}`);
        console.log(`  Ativo: ${updatedAdmin?.active ? 'Sim' : 'Não'}`);
        console.log(`  Total de permissões: ${Array.isArray(updatedAdmin?.permissions) ? updatedAdmin.permissions.length : 'N/A'}`);

      } catch (error) {
        console.error(`❌ Erro ao atualizar permissões para ${adminUser.name}:`, error);
      }
    }

    console.log('\n🎉 Processo de atualização de permissões concluído!');
    console.log('===============================================================');

  } catch (error) {
    console.error('❌ Erro geral ao atualizar permissões:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão com banco de dados fechada');
  }
}

// Executar o script
fixAllAdminPermissions(); 