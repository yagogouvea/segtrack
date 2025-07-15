// backend/src/routes/authRoutes.ts
import { Router } from 'express';
import { login, seedAdmin, loginCliente, cadastrarCliente } from '../controllers/authController';
import clienteAuthRoutes from './clienteAuthRoutes';

const router = Router();

// Rotas existentes para usuários admin
router.post('/login', login);
router.post('/seed-admin', seedAdmin); // rota temporária para gerar admin

// Novas rotas para clientes
router.post('/cliente/login', loginCliente);
router.post('/cliente/cadastro', cadastrarCliente);

// Novas rotas para autenticação de clientes usando ClienteAuth
router.use('/cliente-auth', clienteAuthRoutes);

export default router;
