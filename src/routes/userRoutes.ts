import { Router } from 'express';
import { verifyToken, checkPermissions } from '../middleware/authMiddleware';
import * as userController from '../controllers/userController';

const router: Router = Router();

// Listar todos os usuários (requere permissão users:read)
router.get('/', verifyToken, checkPermissions(['users:read']), userController.getUsers);

// Criar novo usuário (requere permissão users:create)
router.post('/', verifyToken, checkPermissions(['users:create']), userController.createUser);

// Atualizar usuário existente (requere permissão users:update)
router.put('/:id', verifyToken, checkPermissions(['users:update']), userController.updateUser);

// Excluir usuário (requere permissão users:delete)
router.delete('/:id', verifyToken, checkPermissions(['users:delete']), userController.deleteUser);

export default router;
