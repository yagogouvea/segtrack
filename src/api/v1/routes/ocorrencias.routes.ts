import { Router } from 'express';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';
import { OcorrenciaController } from '../controllers/ocorrencia.controller';
import { validateOcorrencia } from '../validators/ocorrencia.validator';
import multer from 'multer';
import { uploadConfig } from '../../../config/upload.config';

const router = Router();
const controller = new OcorrenciaController();
const upload = multer(uploadConfig);

router.use(authenticateToken);

// Listagem e busca
router.get('/', controller.list);
router.get('/:id', controller.findById);

// Criação e atualização
router.post('/', validateOcorrencia, controller.create);
router.put('/:id', validateOcorrencia, controller.update);
router.delete('/:id', controller.delete);

// Upload de fotos
router.post('/:id/fotos', upload.array('fotos'), controller.addFotos);

// Rotas específicas
router.get('/status/:status', controller.findByStatus);
router.get('/placa/:placa', controller.findByPlaca);

export default router; 