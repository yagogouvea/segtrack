import { Router } from 'express';
import { authenticateToken, requirePermission } from '../infrastructure/middleware/auth.middleware';
import { OcorrenciaController } from '../api/v1/controllers/ocorrencia.controller';
import multer from 'multer';
import { uploadConfig } from '../config/upload.config';

const router = Router();
const controller = new OcorrenciaController();
const upload = multer(uploadConfig);

router.use(authenticateToken);

// Listagem e busca
router.get('/', controller.list);
router.get('/:id', controller.getById);

// Criação e atualização
router.post('/', requirePermission('create:ocorrencia'), controller.create);
router.put('/:id', requirePermission('update:ocorrencia'), controller.update);
router.delete('/:id', requirePermission('delete:ocorrencia'), controller.delete);

// Upload de fotos
router.post('/:id/fotos', requirePermission('upload:foto'), upload.array('fotos'), controller.addPhotos);

export default router;
