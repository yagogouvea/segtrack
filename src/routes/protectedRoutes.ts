import express, { Request, Response, NextFunction } from 'express';
import { AuthRequest, AuthUser } from '../middleware/authMiddleware';

const router = express.Router();

// Middleware para verificar permissões
const checkPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!user.permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Permissão negada' });
    }

    next();
  };
};

// Rotas protegidas
router.get('/me', (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  res.json(user);
});

router.get('/protected-resource', 
  checkPermission('read:resource'),
  (req: Request, res: Response) => {
    res.json({ message: 'Acesso permitido ao recurso protegido' });
  }
);

export default router; 