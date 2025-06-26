import { Router } from 'express';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';
import { FotoController } from '../../../controllers/foto.controller';
import multer from 'multer';
import { uploadConfig } from '../../../config/upload.config';

const router = Router();
const controller = new FotoController();
const upload = multer(uploadConfig);

// Reativado para teste com middleware de debug
router.use(authenticateToken);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', upload.single('foto'), controller.upload);
router.delete('/:id', controller.delete);

export default router; 