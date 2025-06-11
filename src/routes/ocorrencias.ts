import { Router } from 'express';
import { authenticateToken, requirePermission } from '../infrastructure/middleware/auth.middleware';
import { OcorrenciaController } from '@/controllers/ocorrencia.controller';
import multer from 'multer';
import { upload } from '../config/upload';

const router = Router();
const controller = new OcorrenciaController();

router.use(authenticateToken);

// Listagem e busca
router.get('/', controller.list);
router.get('/:id', controller.findById);

// Criação e atualização
router.post('/', requirePermission('create:ocorrencia'), controller.create);
router.put('/:id', requirePermission('update:ocorrencia'), controller.update);
router.delete('/:id', requirePermission('delete:ocorrencia'), controller.delete);

// Rotas específicas
router.get('/status/:status', controller.findByStatus);
router.get('/placa/:placa', controller.findByPlaca);

// Upload de fotos
router.post('/:id/fotos', requirePermission('upload:foto'), upload.array('fotos'), controller.addFotos);

export default router;
