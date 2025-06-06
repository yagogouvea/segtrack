import { Router } from 'express';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';
import { RelatorioController } from '../../../controllers/relatorio.controller';

const router = Router();
const controller = new RelatorioController();

router.use(authenticateToken);

router.get('/ocorrencias', controller.gerarRelatorioOcorrencias);
router.get('/prestadores', controller.gerarRelatorioPrestadores);
router.get('/clientes', controller.gerarRelatorioClientes);
router.get('/financeiro', controller.gerarRelatorioFinanceiro);

export default router; 