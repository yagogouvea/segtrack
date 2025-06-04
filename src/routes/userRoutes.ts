import { Router } from 'express';
import { authenticateToken, requirePermission, AuthRequest } from '../middleware/authMiddleware';
import * as userController from '../controllers/userController';

const router: Router = Router();

// Listar todos os usuários (requer permissão de leitura de usuários)
router.get('/', authenticateToken, (req: AuthRequest, res, next) => {
  // Se for admin, permite acesso
  if (req.user?.role === 'admin') {
    return next();
  }
  // Caso contrário, verifica permissão específica
  requirePermission('users:read')(req, res, next);
}, userController.getUsers);

// Obter usuário específico
router.get('/:id', authenticateToken, (req: AuthRequest, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  requirePermission('users:read')(req, res, next);
}, userController.getUser);

// Criar novo usuário
router.post('/', authenticateToken, (req: AuthRequest, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  requirePermission('users:create')(req, res, next);
}, userController.createUser);

// Atualizar usuário
router.put('/:id', authenticateToken, (req: AuthRequest, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  requirePermission('users:update')(req, res, next);
}, userController.updateUser);

// Excluir usuário (requer permissão de exclusão de usuários)
router.delete('/:id', authenticateToken, (req: AuthRequest, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  requirePermission('users:delete')(req, res, next);
}, userController.deleteUser);

export default router;
