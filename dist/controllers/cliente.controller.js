"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteController = void 0;
const prisma_1 = require("../lib/prisma");
const cliente_service_1 = require("../core/services/cliente.service");
class ClienteController {
    constructor() {
        this.list = async (_req, res) => {
            try {
                const clientes = await this.service.list();
                res.json(clientes);
            }
            catch (error) {
                console.error('Erro ao listar clientes:', error);
                res.status(500).json({ error: 'Erro ao listar clientes' });
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                    res.status(400).json({ error: 'ID inválido' });
                    return;
                }
                const cliente = await this.service.findById(id);
                if (!cliente) {
                    res.status(404).json({ error: 'Cliente não encontrado' });
                    return;
                }
                res.json(cliente);
            }
            catch (error) {
                console.error('Erro ao buscar cliente:', error);
                res.status(500).json({ error: 'Erro ao buscar cliente' });
            }
        };
        this.create = async (req, res) => {
            try {
                console.log('📝 Criando cliente com dados:', req.body);
                const cliente = await this.service.create(req.body);
                console.log('✅ Cliente criado:', cliente);
                res.status(201).json(cliente);
            }
            catch (error) {
                console.error('Erro ao criar cliente:', error);
                res.status(500).json({ error: 'Erro ao criar cliente' });
            }
        };
        this.update = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                    res.status(400).json({ error: 'ID inválido' });
                    return;
                }
                console.log('📝 Atualizando cliente ID:', id, 'com dados:', req.body);
                const cliente = await this.service.update(id, req.body);
                if (!cliente) {
                    res.status(404).json({ error: 'Cliente não encontrado' });
                    return;
                }
                console.log('✅ Cliente atualizado:', cliente);
                res.json(cliente);
            }
            catch (error) {
                console.error('Erro ao atualizar cliente:', error);
                res.status(500).json({ error: 'Erro ao atualizar cliente' });
            }
        };
        this.delete = async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                    res.status(400).json({ error: 'ID inválido' });
                    return;
                }
                await this.service.delete(id);
                res.status(204).send();
            }
            catch (error) {
                console.error('Erro ao deletar cliente:', error);
                res.status(500).json({ error: 'Erro ao deletar cliente' });
            }
        };
        this.service = new cliente_service_1.ClienteService(prisma_1.prisma);
    }
}
exports.ClienteController = ClienteController;
