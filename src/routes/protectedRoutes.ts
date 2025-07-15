import { Router } from 'express';
import { requirePermission } from '../infrastructure/middleware/auth.middleware';
import { authenticateCliente } from '../infrastructure/middleware/auth.middleware';
import { ensurePrisma } from '../lib/prisma';

const router = Router();

// Middleware de autenticação para todas as rotas de cliente
router.use(authenticateCliente);

// Rota protegida que requer permissão específica
router.get('/admin', requirePermission('read:dashboard'), async (_req, res) => {
  res.json({ message: 'Acesso permitido - Área administrativa' });
});

// Rota protegida que requer outra permissão
router.get('/manager', requirePermission('read:relatorio'), async (_req, res) => {
  res.json({ message: 'Acesso permitido - Área gerencial' });
});

// Rota para obter dados completos do cliente logado
router.get('/cliente/perfil', async (req, res) => {
  try {
    const cliente = req.cliente;
    if (!cliente) {
      return res.status(401).json({ message: 'Cliente não autenticado' });
    }

    const db = await ensurePrisma();
    const clienteCompleto = await db.cliente.findUnique({
      where: { id: parseInt(cliente.sub) },
      select: {
        id: true,
        nome: true,
        nome_fantasia: true,
        cnpj: true,
        contato: true,
        telefone: true,
        email: true,
        endereco: true,
        bairro: true,
        cidade: true,
        estado: true,
        cep: true,
        logo: true
      }
    });

    if (!clienteCompleto) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json(clienteCompleto);
  } catch (error) {
    console.error('Erro ao obter perfil do cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para obter ocorrências do cliente
router.get('/cliente/ocorrencias', async (req, res) => {
  try {
    const cliente = req.cliente;
    if (!cliente) {
      return res.status(401).json({ message: 'Cliente não autenticado' });
    }

    const db = await ensurePrisma();
    const ocorrencias = await db.ocorrencia.findMany({
      where: { cliente: cliente.razaoSocial },
      orderBy: { criado_em: 'desc' },
      select: {
        id: true,
        placa1: true,
        placa2: true,
        placa3: true,
        tipo: true,
        status: true,
        criado_em: true,
        inicio: true,
        termino: true,
        prestador: true,
        cidade: true,
        estado: true
      }
    });

    res.json({
      message: 'Lista de ocorrências do cliente',
      cliente: cliente.razaoSocial,
      ocorrencias: ocorrencias
    });
  } catch (error) {
    console.error('Erro ao obter ocorrências do cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para obter relatórios do cliente
router.get('/cliente/relatorios', async (req, res) => {
  try {
    const cliente = req.cliente;
    if (!cliente) {
      return res.status(401).json({ message: 'Cliente não autenticado' });
    }

    const db = await ensurePrisma();
    const relatorios = await db.relatorio.findMany({
      where: { cliente: cliente.razaoSocial },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        tipo: true,
        dataAcionamento: true,
        caminhoPdf: true,
        criadoEm: true
      }
    });

    res.json({
      message: 'Lista de relatórios do cliente',
      cliente: cliente.razaoSocial,
      relatorios: relatorios
    });
  } catch (error) {
    console.error('Erro ao obter relatórios do cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

export default router; 