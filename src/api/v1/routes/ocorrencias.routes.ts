import { Router } from 'express';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';
import { OcorrenciaController } from '../controllers/ocorrencia.controller';
import multer from 'multer';
import { uploadConfig } from '../../../config/upload.config';

const router = Router();
const controller = new OcorrenciaController();
const upload = multer(uploadConfig);

router.use(authenticateToken);

// Listagem e busca
router.get('/', controller.list);
router.get('/:id', controller.getById);

// Criação e atualização
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Upload de fotos
router.post('/:id/fotos', upload.array('fotos'), controller.addPhotos);

// Gerar relatório
router.post('/:id/relatorio', controller.generateReport);

export default router; 