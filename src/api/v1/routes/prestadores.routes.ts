import { Router } from 'express';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';
import { PrestadorController } from '../../../controllers/prestador.controller';

const router = Router();
const controller = new PrestadorController();

// Rotas públicas
router.get('/public', controller.listPublic);

// Rotas protegidas
router.use(authenticateToken);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router; 