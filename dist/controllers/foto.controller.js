"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FotoController = void 0;
const prisma_1 = require("../lib/prisma");
const foto_service_1 = require("../core/services/foto.service");
class FotoController {
    constructor() {
        this.list = async (_req, res) => {
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
                    res.status(404).json({ error: 'Foto não encontrada' });
                    return;
                }
                res.json(foto);
            }
            catch (error) {
                console.error('Erro ao buscar foto:', error);
                res.status(500).json({ error: 'Erro ao buscar foto' });
            }
        };
        this.getByOcorrencia = async (req, res) => {
            try {
                const { ocorrenciaId } = req.params;
                const fotos = await this.service.findByOcorrencia(Number(ocorrenciaId));
                res.json(fotos);
            }
            catch (error) {
                console.error('Erro ao buscar fotos da ocorrência:', error);
                res.status(500).json({ error: 'Erro ao buscar fotos da ocorrência' });
            }
        };
        this.update = async (req, res) => {
            try {
                const { id } = req.params;
                const { legenda, cropX, cropY, zoom, cropArea } = req.body;
                console.log('📸 Atualizando foto:', {
                    id,
                    legenda,
                    cropX,
                    cropY,
                    zoom,
                    cropArea: typeof cropArea
                });
                // Permitir legenda vazia ou null, mas deve ser string se fornecida
                if (legenda !== undefined && legenda !== null && typeof legenda !== 'string') {
                    res.status(400).json({ error: 'Legenda deve ser uma string.' });
                    return;
                }
                const updateData = {
                    legenda: legenda || '' // Garantir que legenda seja sempre string
                };
                // Adicionar campos de crop e zoom se fornecidos
                if (cropX !== undefined)
                    updateData.cropX = parseFloat(cropX);
                if (cropY !== undefined)
                    updateData.cropY = parseFloat(cropY);
                if (zoom !== undefined)
                    updateData.zoom = parseFloat(zoom);
                if (cropArea !== undefined) {
                    try {
                        updateData.cropArea = typeof cropArea === 'string' ? JSON.parse(cropArea) : cropArea;
                        console.log('✅ cropArea parseado com sucesso:', updateData.cropArea);
                    }
                    catch (e) {
                        console.warn('❌ Erro ao parsear cropArea:', e);
                    }
                }
                console.log('💾 Dados para atualização:', updateData);
                const fotoAtualizada = await this.service.update(Number(id), updateData);
                console.log('✅ Foto atualizada:', fotoAtualizada);
                res.json(fotoAtualizada);
            }
            catch (error) {
                console.error('❌ Erro ao atualizar foto:', error);
                res.status(500).json({ error: 'Erro ao atualizar foto.', detalhes: String(error) });
            }
        };
        this.upload = async (req, res) => {
            try {
                if (!req.file) {
                    res.status(400).json({ error: 'Nenhum arquivo enviado' });
                    return;
                }
                console.log('Arquivo salvo:', req.file.path);
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
