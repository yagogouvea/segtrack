import { Router } from 'express';
import { verifyToken, checkPermissions } from '../middleware/authMiddleware';
import * as userController from '../controllers/userController';

const router: Router = Router();

// Listar todos os usuários (requere permissão 'view_users')
router.get('/', verifyToken, checkPermissions(['view_users']), userController.getUsers);

// Criar novo usuário (requere permissão 'create_user')
router.post('/', verifyToken, checkPermissions(['create_user']), userController.createUser);

// Atualizar usuário existente (requere permissão 'edit_user')
router.put('/:id', verifyToken, checkPermissions(['edit_user']), userController.updateUser);

// Excluir usuário (requere permissão 'delete_user')
router.delete('/:id', verifyToken, checkPermissions(['delete_user']), userController.deleteUser);

export default router;
