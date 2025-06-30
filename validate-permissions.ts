import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simular o que o middleware faz
function validatePermissionsFormat(permissions: any): boolean {
  try {
    // Se for string, fazer parse
    const parsedPermissions = typeof permissions === 'string' 
      ? JSON.parse(permissions) 
      : permissions;
    
    // Verificar se é array
    if (!Array.isArray(parsedPermissions)) {
      return false;
    }
    
    // Verificar se todos os itens são strings no formato "ação:recurso"
    return parsedPermissions.every((permission: any) => {
      if (typeof permission !== 'string') return false;
      const parts = permission.split(':');
      return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
    });
  } catch (error) {
    return false;
  }
}

// Simular verificação de permissão específica
function hasPermission(permissions: any, requiredPermission: string): boolean {
  try {
    const parsedPermissions = typeof permissions === 'string' 
      ? JSON.parse(permissions) 
      : permissions;
    
    if (!Array.isArray(parsedPermissions)) return false;
    
    return parsedPermissions.includes(requiredPermission);
  } catch (error) {
    return false;
  }
}

async function validatePermissions() {
  try {
    console.log('🔍 Validação final das permissões');
    console.log('==================================');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true
      }
    });

    let allValid = true;

    for (const user of users) {
      console.log(`\n👤 Validando usuário: ${user.name} (${user.email})`);
      
      // Validar formato
      const isValidFormat = validatePermissionsFormat(user.permissions);
      console.log(`✅ Formato válido: ${isValidFormat ? 'SIM' : 'NÃO'}`);
      
      if (!isValidFormat) {
        allValid = false;
        console.log('❌ Formato inválido detectado!');
        continue;
      }
      
      // Mostrar permissões
      const permissions = typeof user.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user.permissions;
      
      console.log(`📋 Permissões (${permissions.length}):`, permissions);
      
      // Testar algumas permissões específicas
      const testPermissions = [
        'create:user',
        'read:ocorrencia', 
        'update:client',
        'delete:prestador'
      ];
      
      console.log('🧪 Testando permissões específicas:');
      testPermissions.forEach(permission => {
        const hasPerm = hasPermission(user.permissions, permission);
        console.log(`  ${permission}: ${hasPerm ? '✅' : '❌'}`);
      });
      
      // Verificar se admin tem permissões adequadas
      if (user.role === 'admin') {
        const adminPermissions = [
          'create:user',
          'read:user',
          'update:user', 
          'delete:user'
        ];
        
        const hasAdminPerms = adminPermissions.every(perm => 
          hasPermission(user.permissions, perm)
        );
        
        console.log(`👑 Permissões de admin adequadas: ${hasAdminPerms ? '✅' : '❌'}`);
        
        if (!hasAdminPerms) {
          allValid = false;
        }
      }
    }

    console.log('\n🎯 Resultado da validação:');
    console.log('==========================');
    
    if (allValid) {
      console.log('✅ TODAS as validações passaram!');
      console.log('✅ Permissões estão no formato correto para o middleware');
      console.log('✅ Migração concluída com sucesso!');
    } else {
      console.log('❌ Algumas validações falharam');
      console.log('❌ Verifique os problemas acima');
    }

  } catch (error) {
    console.error('❌ Erro durante validação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

validatePermissions(); 