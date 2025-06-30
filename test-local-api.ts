import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function testLocalAPI() {
  try {
    console.log('🧪 Testando API local...');
    
    // 1. Verificar se o admin existe
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@segtrack.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin não encontrado');
      return;
    }
    
    console.log('✅ Admin encontrado:', admin.name);
    
    // 2. Gerar um novo token JWT
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        sub: admin.id,
        nome: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      secret,
      { expiresIn: '24h' }
    );
    
    console.log('✅ Token JWT gerado');
    console.log('Token:', token.substring(0, 50) + '...');
    
    // 3. Testar se o token é válido
    try {
      const decoded = jwt.verify(token, secret);
      console.log('✅ Token válido');
      console.log('Payload:', JSON.stringify(decoded, null, 2));
    } catch (error) {
      console.log('❌ Token inválido:', error);
    }
    
    // 4. Verificar permissões
    const permissions = Array.isArray(admin.permissions) 
      ? admin.permissions 
      : typeof admin.permissions === 'string' 
        ? JSON.parse(admin.permissions) 
        : [];
    
    console.log('📋 Permissões do admin:', permissions);
    console.log('📊 Total de permissões:', permissions.length);
    
    // 5. Verificar permissões específicas
    const requiredPermissions = ['create:user', 'read:user', 'update:user', 'delete:user'];
    const hasAllPermissions = requiredPermissions.every(perm => permissions.includes(perm));
    
    console.log('🔍 Verificando permissões de usuário:');
    requiredPermissions.forEach(perm => {
      const has = permissions.includes(perm);
      console.log(`  ${perm}: ${has ? '✅' : '❌'}`);
    });
    
    console.log(`\n🎯 Admin tem todas as permissões de usuário: ${hasAllPermissions ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLocalAPI(); 