import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAdminPermissions() {
  try {
    console.log('🔍 Verificando permissões dos usuários admin...');
    console.log('=============================================');
    
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
    
    for (const adminUser of adminUsers) {
      console.log(`\n👤 ${adminUser.name} (${adminUser.email})`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Ativo: ${adminUser.active ? 'Sim' : 'Não'}`);
      
      if (Array.isArray(adminUser.permissions)) {
        console.log(`   Total de permissões: ${adminUser.permissions.length}`);
        console.log(`   Permissões:`);
        
        // Agrupar permissões por categoria
        const groupedPermissions: Record<string, string[]> = {};
        
        (adminUser.permissions as string[]).forEach((permission: string) => {
          const [action, resource] = permission.split(':');
          if (!groupedPermissions[resource]) {
            groupedPermissions[resource] = [];
          }
          groupedPermissions[resource].push(action);
        });
        
        Object.entries(groupedPermissions).forEach(([resource, actions]) => {
          console.log(`     ${resource}: ${actions.join(', ')}`);
        });
        
        // Verificar se tem todas as permissões essenciais
        const essentialPermissions = [
          'read:dashboard',
          'read:user', 'create:user', 'update:user', 'delete:user',
          'read:cliente', 'create:cliente', 'update:cliente', 'delete:cliente',
          'read:ocorrencia', 'create:ocorrencia', 'update:ocorrencia', 'delete:ocorrencia',
          'read:prestador', 'create:prestador', 'update:prestador', 'delete:prestador',
          'read:relatorio', 'create:relatorio', 'update:relatorio', 'delete:relatorio'
        ];
        
        const missingPermissions = essentialPermissions.filter(perm => 
          !(adminUser.permissions as string[]).includes(perm)
        );
        
        if (missingPermissions.length === 0) {
          console.log(`   ✅ Todas as permissões essenciais estão presentes`);
        } else {
          console.log(`   ❌ Permissões essenciais faltando: ${missingPermissions.join(', ')}`);
        }
        
      } else {
        console.log(`   ❌ Permissões não estão no formato correto:`, adminUser.permissions);
      }
    }
    
    console.log('\n🎉 Verificação concluída!');
    console.log('=============================================');

  } catch (error) {
    console.error('❌ Erro ao verificar permissões:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão com banco de dados fechada');
  }
}

// Executar o script
verifyAdminPermissions(); 