import { Router } from 'express';
import { authenticateToken, requirePermission } from '../infrastructure/middleware/auth.middleware';
import { OcorrenciaController } from '@/controllers/ocorrencia.controller';
import multer from 'multer';
import { upload } from '../config/upload';

const router = Router();
const controller = new OcorrenciaController();

// Rota de teste sem autenticação
router.get('/test', (req, res) => {
  console.log('[ocorrencias] Rota de teste acessada');
  res.json({ message: 'Rota de teste funcionando!' });
});

router.use(authenticateToken);

// Rota de teste com autenticação
router.get('/test-auth', (req, res) => {
  console.log('[ocorrencias] Rota de teste com auth acessada');
  res.json({ message: 'Rota de teste com auth funcionando!', user: req.user });
});

// Listagem e busca
router.get('/', (req, res) => controller.list(req, res));
router.get('/:id', (req, res) => controller.findById(req, res));

// Criação e atualização
router.post('/', requirePermission('create:ocorrencia'), (req, res) => controller.create(req, res));
router.put('/:id', requirePermission('update:ocorrencia'), (req, res) => controller.update(req, res));
router.delete('/:id', requirePermission('delete:ocorrencia'), (req, res) => controller.delete(req, res));

// Rotas específicas
router.get('/status/:status', (req, res) => controller.findByStatus(req, res));
router.get('/placa/:placa', (req, res) => controller.findByPlaca(req, res));

// Rota para buscar resultado de uma ocorrência
router.get('/:id/resultado', (req, res) => controller.findResultado(req, res));

// Upload de fotos
router.post('/:id/fotos', requirePermission('upload:foto'), upload.array('fotos'), (req, res) => controller.addFotos(req, res));

export default router;
