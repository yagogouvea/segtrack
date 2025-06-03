import { Router } from 'express';
import { verifyToken, checkPermissions } from '../middleware/authMiddleware';
import * as userController from '../controllers/userController';

const router: Router = Router();

// Listar todos os usuários (requer permissão de leitura de usuários)
router.get('/', verifyToken, (req, res, next) => {
  // Se for admin, permite acesso
  if (req.user?.role === 'admin') {
    return next();
  }
  // Caso contrário, verifica permissão específica
  checkPermissions(['users:read'])(req, res, next);
}, userController.getUsers);

// Criar usuário (requer permissão de criação de usuários)
router.post('/', verifyToken, (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  checkPermissions(['users:create'])(req, res, next);
}, userController.createUser);

// Atualizar usuário (requer permissão de atualização de usuários)
router.put('/:id', verifyToken, (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  checkPermissions(['users:update'])(req, res, next);
}, userController.updateUser);

// Excluir usuário (requer permissão de exclusão de usuários)
router.delete('/:id', verifyToken, (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  checkPermissions(['users:delete'])(req, res, next);
}, userController.deleteUser);

export default router;
