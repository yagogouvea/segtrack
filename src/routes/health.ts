import { Router } from 'express';
import { testConnection } from '../lib/prisma';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    await testConnection();
    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: String(error) });
  }
});

export default router; 