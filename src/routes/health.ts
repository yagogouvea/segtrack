import { Router } from 'express';
import { testConnection } from '../lib/prisma';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'API SEGTRACK funcionando corretamente!' });
});

export default router; 