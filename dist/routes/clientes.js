"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/clientes.ts
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cliente_controller_1 = require("../controllers/cliente.controller");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const controller = new cliente_controller_1.ClienteController();
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
exports.default = router;
