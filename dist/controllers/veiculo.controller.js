"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeiculoController = void 0;
const prisma_1 = require("../lib/prisma");
const veiculo_service_1 = require("../core/services/veiculo.service");
class VeiculoController {
    constructor() {
        this.list = async (_req, res) => {
            try {
                const veiculos = await this.service.list();
                res.json(veiculos);
            }
            catch (error) {
                console.error('Erro ao listar veículos:', error);
                res.status(500).json({ error: 'Erro ao listar veículos' });
            }
        };
        this.getById = async (req, res) => {
            try {
                const { id } = req.params;
                const veiculo = await this.service.findById(Number(id));
                if (!veiculo) {
                    res.status(404).json({ error: 'Veículo não encontrado' });
                    return;
                }
                res.json(veiculo);
            }
            catch (error) {
                console.error('Erro ao buscar veículo:', error);
                res.status(500).json({ error: 'Erro ao buscar veículo' });
            }
        };
        this.create = async (req, res) => {
            try {
                const veiculo = await this.service.create(req.body);
                res.status(201).json(veiculo);
            }
            catch (error) {
                console.error('Erro ao criar veículo:', error);
                res.status(500).json({ error: 'Erro ao criar veículo' });
            }
        };
        this.update = async (req, res) => {
            try {
                const { id } = req.params;
                const veiculo = await this.service.update(Number(id), req.body);
                if (!veiculo) {
                    res.status(404).json({ error: 'Veículo não encontrado' });
                    return;
                }
                res.json(veiculo);
            }
            catch (error) {
                console.error('Erro ao atualizar veículo:', error);
                res.status(500).json({ error: 'Erro ao atualizar veículo' });
            }
        };
        this.delete = async (req, res) => {
            try {
                const { id } = req.params;
                await this.service.delete(Number(id));
                res.status(204).send();
            }
            catch (error) {
                console.error('Erro ao deletar veículo:', error);
                res.status(500).json({ error: 'Erro ao deletar veículo' });
            }
        };
        this.service = new veiculo_service_1.VeiculoService(prisma_1.prisma);
    }
}
exports.VeiculoController = VeiculoController;
