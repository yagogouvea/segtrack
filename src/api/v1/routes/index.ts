import { Router } from 'express';
import { authenticateToken } from '@/infrastructure/middleware/auth.middleware';
import { PrestadorController } from '../../../controllers/prestador.controller';

import prestadoresRouter from './prestadores.routes';
import clientesRouter from './clientes.routes';
import veiculosRouter from './veiculos.routes';
import fotosRouter from './fotos.routes';
import relatoriosRouter from './relatorios.routes';
import userRouter from './user.routes';
import monitoramentoRouter from './monitoramento.routes';
import ocorrenciasRouter from './ocorrencias.routes';

const v1Router = Router();
const prestadorController = new PrestadorController();

// Rotas públicas (sem autenticação)
v1Router.use('/prestadores', prestadoresRouter); // Rotas públicas e protegidas estão no próprio router
v1Router.use('/ocorrencias', ocorrenciasRouter); // Rotas públicas e protegidas estão no próprio router

// Rotas protegidas (com autenticação)
v1Router.use('/clientes', authenticateToken, clientesRouter);
v1Router.use('/veiculos', authenticateToken, veiculosRouter);
// v1Router.use('/fotos', authenticateToken, fotosRouter); // TEMPORARIAMENTE COMENTADO PARA TESTE
v1Router.use('/fotos', fotosRouter); // SEM AUTENTICAÇÃO TEMPORARIAMENTE
v1Router.use('/relatorios', authenticateToken, relatoriosRouter);
v1Router.use('/users', authenticateToken, userRouter);
v1Router.use('/monitoramento', authenticateToken, monitoramentoRouter);

export default v1Router; 