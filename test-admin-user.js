// Teste para verificar usuário admin
const { PrismaClient } = require('@prisma/client');

async function testAdminUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando usuário admin...');
    
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@segtrack.com.br'
      }
    });
    
    if (adminUser) {
      console.log('✅ Usuário admin encontrado:', {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        active: adminUser.active
      });
    } else {
      console.log('❌ Usuário admin não encontrado');
      
      // Listar todos os usuários
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true
        }
      });
      
      console.log('📋 Usuários disponíveis:', allUsers);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminUser(); 