import { Router } from 'express';
import { OcorrenciaController } from '../controllers/ocorrencia.controller';
import { validateOcorrencia } from '../validators/ocorrencia.validator';

const router = Router();
const controller = new OcorrenciaController();

// Listar ocorrências
router.get('/', controller.list);

// Buscar ocorrência por ID
router.get('/:id', controller.getById);

// Criar nova ocorrência
router.post('/', validateOcorrencia, controller.create);

// Atualizar ocorrência
router.put('/:id', validateOcorrencia, controller.update);

// Excluir ocorrência
router.delete('/:id', controller.delete);

// Buscar por status
router.get('/status/:status', controller.listByStatus);

// Adicionar fotos
router.post('/:id/fotos', controller.addPhotos);

// Gerar relatório
router.post('/:id/relatorio', controller.generateReport);

export default router; 