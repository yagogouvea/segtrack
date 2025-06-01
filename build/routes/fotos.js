"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("../lib/db");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// 🔹 Upload de novas fotos
router.post('/', upload.array('imagens'), async (req, res) => {
    const { ocorrenciaId } = req.body;
    const arquivos = req.files;
    const legendas = Array.isArray(req.body.legendas) ? req.body.legendas : [req.body.legendas];
    if (!ocorrenciaId) {
        return res.status(400).json({ error: 'ocorrenciaId é obrigatório.' });
    }
    try {
        const fotosCriadas = await Promise.all(arquivos.map((file, i) => {
            const extensao = path_1.default.extname(file.originalname) || '.jpg';
            const nomeArquivo = `${Date.now()}-${Math.random().toString(36).substring(2)}${extensao}`;
            const destino = path_1.default.join('uploads', nomeArquivo);
            fs_1.default.renameSync(file.path, destino);
            const url = `/uploads/${nomeArquivo}`;
            return db_1.prisma.foto.create({
                data: {
                    url,
                    legenda: legendas[i] || '',
                    ocorrenciaId: Number(ocorrenciaId)
                }
            });
        }));
        res.status(201).json(fotosCriadas);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao salvar fotos.', detalhes: String(error) });
    }
});
// 🔹 Atualizar legenda da foto
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { legenda } = req.body;
    try {
        const fotoAtualizada = await db_1.prisma.foto.update({
            where: { id: Number(id) },
            data: { legenda }
        });
        res.json(fotoAtualizada);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar legenda da foto.', detalhes: String(error) });
    }
});
// 🔹 Remover foto
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const foto = await db_1.prisma.foto.findUnique({ where: { id: Number(id) } });
        if (!foto) {
            return res.status(404).json({ error: 'Foto não encontrada.' });
        }
        if (foto.url) {
            const caminho = path_1.default.join('uploads', path_1.default.basename(foto.url));
            if (fs_1.default.existsSync(caminho)) {
                fs_1.default.unlinkSync(caminho);
            }
        }
        await db_1.prisma.foto.delete({ where: { id: Number(id) } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao deletar foto.', detalhes: String(error) });
    }
});
// 🔹 Listar fotos por ocorrência
router.get('/por-ocorrencia/:ocorrenciaId', async (req, res) => {
    const { ocorrenciaId } = req.params;
    try {
        const fotos = await db_1.prisma.foto.findMany({
            where: { ocorrenciaId: Number(ocorrenciaId) },
            orderBy: { id: 'asc' }
        });
        res.json(fotos);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar fotos.', detalhes: String(error) });
    }
});
exports.default = router;
