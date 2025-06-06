import { Router } from 'express';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';
import { ClienteController } from '../../../controllers/cliente.controller';

const router = Router();
const controller = new ClienteController();

router.use(authenticateToken);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router; 