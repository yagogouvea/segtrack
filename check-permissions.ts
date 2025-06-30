import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPermissions() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true
      }
    });

    console.log('🔍 Verificando formato das permissões:');
    console.log('=====================================');

    users.forEach((user, index) => {
      console.log(`\n👤 Usuário ${index + 1}: ${user.name} (${user.email})`);
      console.log(`Role: ${user.role}`);
      console.log(`Tipo do campo permissions: ${typeof user.permissions}`);
      
      if (user.permissions) {
        console.log('Permissões atuais:');
        console.log(JSON.stringify(user.permissions, null, 2));
        
        // Verificar se é objeto ou array
        if (typeof user.permissions === 'object') {
          if (Array.isArray(user.permissions)) {
            console.log('✅ Formato: Array de strings (já no formato correto)');
          } else {
            console.log('⚠️  Formato: Objeto (precisa migração)');
            console.log('Estrutura detectada:', Object.keys(user.permissions));
          }
        } else {
          console.log('⚠️  Formato: String JSON (precisa verificação)');
        }
      } else {
        console.log('❌ Sem permissões definidas');
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar permissões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissions(); 