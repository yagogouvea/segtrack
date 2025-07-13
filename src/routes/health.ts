import { Router } from 'express';
import { testConnection } from '../lib/prisma';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    await testConnection();
    return res.status(200).json({ message: 'API SEGTRACK funcionando corretamente!' });
  } catch (error: unknown) {
    console.error('Erro ao verificar saúde do sistema:', error);
    res.status(500).json({ status: 'error', message: 'Erro interno do servidor' });
  }
});

export default router; 