import { Router } from 'express';
import { testConnection } from '../lib/prisma';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    await testConnection();
    return res.status(200).json({ message: 'API SEGTRACK funcionando corretamente!' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao conectar com o banco de dados', error: String(error) });
  }
});

export default router; 