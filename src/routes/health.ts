import { Router } from 'express';
import { testConnection } from '../lib/prisma';

const router = Router();

router.get('/health', (req, res) => {
  return res.status(200).json({ message: 'API SEGTRACK funcionando corretamente!' });
});

export default router; 