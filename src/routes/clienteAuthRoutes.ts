import { Router } from 'express';
import { loginCliente, cadastrarClienteComAuth } from '../controllers/clienteAuthController';

const router = Router();

// Rotas para autenticação de clientes usando a nova tabela ClienteAuth
router.post('/login', loginCliente);
router.post('/cadastro', cadastrarClienteComAuth);

export default router; 