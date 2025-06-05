import { Router } from 'express';
import ocorrenciasRouter from './ocorrencias.routes';
import prestadoresRouter from './prestadores.routes';
import clientesRouter from './clientes.routes';
import veiculosRouter from './veiculos.routes';
import fotosRouter from './fotos.routes';
import relatoriosRouter from './relatorios.routes';
import userRouter from './user.routes';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';

const v1Router = Router();

// Rotas públicas
v1Router.use('/prestadores-publico', prestadoresRouter.publicRoutes);

// Rotas protegidas
v1Router.use('/ocorrencias', authenticateToken, ocorrenciasRouter);
v1Router.use('/prestadores', authenticateToken, prestadoresRouter.privateRoutes);
v1Router.use('/clientes', authenticateToken, clientesRouter);
v1Router.use('/veiculos', authenticateToken, veiculosRouter);
v1Router.use('/fotos', authenticateToken, fotosRouter);
v1Router.use('/relatorios', authenticateToken, relatoriosRouter);
v1Router.use('/users', authenticateToken, userRouter);

export default v1Router; 