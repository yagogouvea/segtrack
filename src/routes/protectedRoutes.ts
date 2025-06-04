import { Router } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/authMiddleware';

const router = Router();

// Exemplo de rota protegida que requer autenticação
router.get('/profile', (req: AuthRequest, res) => {
  // O usuário já está autenticado neste ponto
  res.json({
    message: 'Perfil do usuário',
    user: req.user
  });
});

// Exemplo de rota que requer permissão específica
router.post('/admin-action', requirePermission('ADMIN'), (req: AuthRequest, res) => {
  res.json({
    message: 'Ação administrativa realizada com sucesso',
    user: req.user
  });
});

export default router; 