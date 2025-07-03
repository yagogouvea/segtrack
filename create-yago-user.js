const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createYagoUser() {
  try {
    const passwordHash = await bcrypt.hash('123456', 10);
    
    const userData = {
      name: 'Yago',
      email: 'yago@segtrack',
      passwordHash: passwordHash,
      role: 'admin',
      permissions: [
        'create:user',
        'read:user', 
        'update:user',
        'delete:user',
        'create:cliente',
        'read:cliente',
        'update:cliente',
        'delete:cliente',
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
      ],
      active: true,
      updatedAt: new Date()
    };

    const user = await prisma.user.create({
      data: userData
    });

    console.log('Usuário yago criado com sucesso:', {
      id: user.id,
      name: user.name,
      email: user.email,
      password: '123456'
    });
  } catch (error) {
    console.error('Erro ao criar usuário yago:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createYagoUser(); 