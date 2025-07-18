import { Router } from 'express';
import { loginCliente, cadastrarClienteComAuth, alterarSenhaCliente } from '../controllers/clienteAuthController';
import { authenticateCliente } from '../infrastructure/middleware/auth.middleware';

const router = Router();

// Rotas para autenticação de clientes usando a nova tabela ClienteAuth
router.post('/login', loginCliente);
router.post('/cadastro', cadastrarClienteComAuth);

// Rota protegida para alterar senha (requer autenticação de cliente)
router.put('/alterar-senha', authenticateCliente, alterarSenhaCliente);

export default router; 