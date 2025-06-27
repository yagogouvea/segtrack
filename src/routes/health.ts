import { Router } from 'express';
import { testConnection } from '../lib/prisma';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    await testConnection();
    return res.status(200).json({ message: 'API SEGTRACK funcionando corretamente!' });
  } catch (error) {
    console.error('Erro ao conectar com o banco:', error);
    // Retorna 200 mesmo com erro de banco para não quebrar o frontend
    return res.status(200).json({ 
      message: 'API SEGTRACK funcionando (banco offline)', 
      database: 'offline',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

export default router; 