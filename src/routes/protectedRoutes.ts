import { Router } from 'express';
import { requirePermission } from '../infrastructure/middleware/auth.middleware';

const router = Router();

// Rota protegida que requer permissão específica
router.get('/admin', requirePermission('read:dashboard'), async (_req, res) => {
  res.json({ message: 'Acesso permitido - Área administrativa' });
});

// Rota protegida que requer outra permissão
router.get('/manager', requirePermission('read:relatorio'), async (_req, res) => {
  res.json({ message: 'Acesso permitido - Área gerencial' });
});

export default router; 