import express from 'express';
import { requirePermission, AuthRequest, createAuthenticatedHandler } from '../middleware/authMiddleware';

const router = express.Router();

// Get current user
router.get('/me', 
  createAuthenticatedHandler(async (req: AuthRequest, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    res.json(req.user);
  })
);

// Protected resource example
router.get('/protected-resource',
  requirePermission('resource:read'),
  createAuthenticatedHandler(async (req: AuthRequest, res) => {
    res.json({ message: 'Você tem acesso a este recurso protegido' });
  })
);

export default router; 