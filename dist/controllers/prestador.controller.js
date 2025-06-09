"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrestadorController = void 0;
const prestador_service_1 = require("../core/services/prestador.service");
class PrestadorController {
    constructor() {
        this.listPublic = async (_req, res) => {
            try {
                const prestadores = await this.service.listPublic();
                res.json(prestadores);
            }
            catch (error) {
                console.error('Erro ao listar prestadores públicos:', error);
                res.status(500).json({ error: 'Erro ao listar prestadores públicos' });
            }
        };
        this.list = async (_req, res) => {
            try {
                const prestadores = await this.service.list();
                res.json(prestadores);
            }
            catch (error) {
                console.error('Erro ao listar prestadores:', error);
                res.status(500).json({ error: 'Erro ao listar prestadores' });
            }
        };
        this.getById = async (req, res) => {
            try {
                const { id } = req.params;
                const prestador = await this.service.findById(Number(id));
                if (!prestador) {
                    res.status(404).json({ error: 'Prestador não encontrado' });
                    return;
                }
                res.json(prestador);
            }
            catch (error) {
                console.error('Erro ao buscar prestador:', error);
                res.status(500).json({ error: 'Erro ao buscar prestador' });
            }
        };
        this.create = async (req, res) => {
            try {
                const prestador = await this.service.create(req.body);
                res.status(201).json(prestador);
            }
            catch (error) {
                console.error('Erro ao criar prestador:', error);
                res.status(500).json({ error: 'Erro ao criar prestador' });
            }
        };
        this.update = async (req, res) => {
            try {
                const { id } = req.params;
                const prestador = await this.service.update(Number(id), req.body);
                if (!prestador) {
                    res.status(404).json({ error: 'Prestador não encontrado' });
                    return;
                }
                res.json(prestador);
            }
            catch (error) {
                console.error('Erro ao atualizar prestador:', error);
                res.status(500).json({ error: 'Erro ao atualizar prestador' });
            }
        };
        this.delete = async (req, res) => {
            try {
                const { id } = req.params;
                await this.service.delete(Number(id));
                res.status(204).send();
            }
            catch (error) {
                console.error('Erro ao deletar prestador:', error);
                res.status(500).json({ error: 'Erro ao deletar prestador' });
            }
        };
        this.service = new prestador_service_1.PrestadorService();
    }
}
exports.PrestadorController = PrestadorController;
