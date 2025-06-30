import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeamento de recursos antigos para novos
const resourceMapping: { [key: string]: string } = {
  'users': 'user',
  'clients': 'client', 
  'occurrences': 'ocorrencia',
  'providers': 'prestador',
  'reports': 'relatorio',
  'contracts': 'contrato'
};

// Função para converter permissões de objeto para array
function convertPermissionsToArray(permissionsObj: any): string[] {
  const permissionsArray: string[] = [];
  
  for (const [resource, actions] of Object.entries(permissionsObj)) {
    const newResource = resourceMapping[resource] || resource;
    
    if (Array.isArray(actions)) {
      actions.forEach((action: string) => {
        permissionsArray.push(`${action}:${newResource}`);
      });
    }
  }
  
  return permissionsArray;
}

// Permissões padrão para admin no novo formato
const adminPermissions = [
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
];

async function migratePermissions() {
  try {
    console.log('🔄 Iniciando migração de permissões...');
    console.log('=====================================');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true
      }
    });

    for (const user of users) {
      console.log(`\n👤 Processando usuário: ${user.name} (${user.email})`);
      
      let newPermissions: string[];
      
      if (user.permissions) {
        try {
          // Se for string JSON, fazer parse
          const permissionsData = typeof user.permissions === 'string' 
            ? JSON.parse(user.permissions) 
            : user.permissions;
          
          console.log('📋 Permissões antigas:', JSON.stringify(permissionsData, null, 2));
          
          // Converter para novo formato
          newPermissions = convertPermissionsToArray(permissionsData);
          
          console.log('🔄 Convertendo para novo formato...');
        } catch (error) {
          console.log('⚠️  Erro ao fazer parse das permissões, usando permissões padrão para admin');
          newPermissions = user.role === 'admin' ? adminPermissions : [];
        }
      } else {
        console.log('⚠️  Sem permissões definidas, usando permissões padrão para admin');
        newPermissions = user.role === 'admin' ? adminPermissions : [];
      }
      
      console.log('✅ Novas permissões:', newPermissions);
      
      // Atualizar no banco
      await prisma.user.update({
        where: { id: user.id },
        data: {
          permissions: newPermissions
        }
      });
      
      console.log('✅ Usuário atualizado com sucesso!');
    }

    console.log('\n🎉 Migração concluída!');
    
    // Verificar resultado
    console.log('\n🔍 Verificando resultado da migração:');
    const updatedUsers = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        permissions: true
      }
    });
    
    updatedUsers.forEach(user => {
      console.log(`\n👤 ${user.name} (${user.email}):`);
      console.log('Permissões:', user.permissions);
    });

  } catch (error) {
    console.error('❌ Erro durante migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migratePermissions(); 