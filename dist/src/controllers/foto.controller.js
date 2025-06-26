"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FotoController = void 0;
const prisma_1 = require("../lib/prisma");
const foto_service_1 = require("../core/services/foto.service");
class FotoController {
    constructor() {
        this.list = async (req, res) => {
            try {
                const fotos = await this.service.list();
                res.json(fotos);
            }
            catch (error) {
                console.error('Erro ao listar fotos:', error);
                res.status(500).json({ error: 'Erro ao listar fotos' });
            }
        };
        this.getById = async (req, res) => {
            try {
                const { id } = req.params;
                const foto = await this.service.findById(Number(id));
                if (!foto) {
                    return res.status(404).json({ error: 'Foto não encontrada' });
                }
                res.json(foto);
            }
            catch (error) {
                console.error('Erro ao buscar foto:', error);
                res.status(500).json({ error: 'Erro ao buscar foto' });
            }
        };
        this.upload = async (req, res) => {
            try {
                if (!req.file) {
                    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
                }
                const foto = await this.service.upload({
                    url: req.file.path,
                    legenda: req.body.legenda || '',
                    ocorrenciaId: Number(req.body.ocorrenciaId)
                });
                res.status(201).json(foto);
            }
            catch (error) {
                console.error('Erro ao fazer upload da foto:', error);
                res.status(500).json({ error: 'Erro ao fazer upload da foto' });
            }
        };
        this.delete = async (req, res) => {
            try {
                const { id } = req.params;
                await this.service.delete(Number(id));
                res.status(204).send();
            }
            catch (error) {
                console.error('Erro ao deletar foto:', error);
                res.status(500).json({ error: 'Erro ao deletar foto' });
            }
        };
        this.service = new foto_service_1.FotoService(prisma_1.prisma);
    }
}
exports.FotoController = FotoController;
//# sourceMappingURL=foto.controller.js.map