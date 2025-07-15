// backend/src/routes/authRoutes.ts
import { Router } from 'express';
import { login, seedAdmin, loginCliente, cadastrarCliente } from '../controllers/authController';

const router = Router();

// Rotas existentes para usuários admin
router.post('/login', login);
router.post('/seed-admin', seedAdmin); // rota temporária para gerar admin

// Novas rotas para clientes
router.post('/cliente/login', loginCliente);
router.post('/cliente/cadastro', cadastrarCliente);

export default router;
