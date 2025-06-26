import { Router } from 'express';
import { authenticateToken, requirePermission } from '../../../infrastructure/middleware/auth.middleware';
import { UserController } from '../../../controllers/user.controller';

const router = Router();
const controller = new UserController();

router.use(authenticateToken);

// Rotas que requerem autenticação
router.get('/me', controller.getCurrentUser);
router.put('/me', controller.updateCurrentUser);
router.put('/me/password', controller.updatePassword);

// Rotas administrativas
router.get('/', requirePermission('read:user'), controller.list);
router.post('/', requirePermission('create:user'), controller.create);
router.get('/:id', requirePermission('read:user'), controller.getById);
router.put('/:id', requirePermission('update:user'), controller.update);
router.delete('/:id', requirePermission('delete:user'), controller.delete);

export default router; 