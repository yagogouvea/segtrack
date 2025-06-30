import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import express from 'express';
import { authenticateToken, requirePermission } from './src/infrastructure/middleware/auth.middleware';
import { UserController } from './src/controllers/user.controller';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Simular o endpoint de usuários
app.get('/api/users', authenticateToken, requirePermission('read:user'), async (req, res) => {
  try {
    const controller = new UserController();
    await controller.list(req, res);
  } catch (error) {
    console.error('Erro no endpoint:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/api/users', authenticateToken, requirePermission('create:user'), async (req, res) => {
  try {
    const controller = new UserController();
    await controller.create(req, res);
  } catch (error) {
    console.error('Erro no endpoint:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

async function testEndpoint() {
  try {
    console.log('🧪 Testando endpoint de usuários...');
    
    // 1. Buscar admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@segtrack.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin não encontrado');
      return;
    }
    
    // 2. Gerar token
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
    
    console.log('✅ Token gerado:', token.substring(0, 50) + '...');
    
    // 3. Testar GET /api/users
    const server = app.listen(3001, () => {
      console.log('🚀 Servidor de teste rodando na porta 3001');
    });
    
    // Aguardar um pouco para o servidor inicializar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fazer requisição GET
    const fetch = (await import('node-fetch')).default;
    
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Status da resposta GET:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ GET /api/users funcionou!');
        console.log('Dados:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ GET /api/users falhou:', errorText);
      }
    } catch (error) {
      console.log('❌ Erro na requisição GET:', error);
    }
    
    // Fazer requisição POST
    try {
      const newUser = {
        name: 'Teste User',
        email: 'teste@teste.com',
        password: '123456',
        role: 'operator',
        permissions: ['read:ocorrencia']
      };
      
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });
      
      console.log('📊 Status da resposta POST:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ POST /api/users funcionou!');
        console.log('Usuário criado:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ POST /api/users falhou:', errorText);
      }
    } catch (error) {
      console.log('❌ Erro na requisição POST:', error);
    }
    
    // Fechar servidor
    server.close(() => {
      console.log('🔒 Servidor de teste fechado');
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEndpoint(); 