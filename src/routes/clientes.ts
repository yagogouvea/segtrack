// backend/routes/clientes.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ClienteController } from '../controllers/cliente.controller';

const router = express.Router();
const prisma = new PrismaClient();
const controller = new ClienteController();

// ✅ NOVA ROTA PARA LISTAR CLIENTES COM ID E NOME
router.get('/resumo', (req, res) => controller.list(req, res));

// Listar todos os clientes com seus contratos
router.get('/', (req, res) => controller.list(req, res));

// Buscar cliente por ID
router.get('/:id', (req, res) => controller.getById(req, res));

// Criar novo cliente
router.post('/', (req, res) => controller.create(req, res));

// Atualizar cliente existente
router.put('/:id', (req, res) => controller.update(req, res));

// Excluir cliente
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
