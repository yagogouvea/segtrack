"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads/relatorios'));
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({ storage });
router.post('/upload', upload.single('arquivo'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Nenhum arquivo enviado' });
            return;
        }
        // Log do caminho do arquivo salvo
        console.log('Arquivo salvo (relatorios.ts):', req.file.path);
        const { filename } = req.file;
        const { ocorrenciaId, cliente, tipo, dataAcionamento } = req.body;
        const relatorio = await prisma_1.prisma.relatorio.create({
            data: {
                ocorrenciaId: parseInt(ocorrenciaId),
                cliente,
                tipo,
                dataAcionamento: new Date(dataAcionamento),
                caminhoPdf: filename,
                criadoEm: new Date()
            }
        });
        res.status(201).json(relatorio);
    }
    catch (error) {
        console.error('Erro ao fazer upload do relatório:', error);
        res.status(500).json({ error: 'Erro ao fazer upload do relatório' });
    }
});
router.get('/', async (_req, res) => {
    try {
        const relatorios = await prisma_1.prisma.relatorio.findMany({
            orderBy: {
                criadoEm: 'desc'
            }
        });
        res.json(relatorios);
    }
    catch (error) {
        console.error('Erro ao listar relatórios:', error);
        res.status(500).json({ error: 'Erro ao listar relatórios' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: 'ID inválido' });
            return;
        }
        const relatorio = await prisma_1.prisma.relatorio.findUnique({
            where: { id }
        });
        if (!relatorio) {
            res.status(404).json({ error: 'Relatório não encontrado' });
            return;
        }
        res.json(relatorio);
    }
    catch (error) {
        console.error('Erro ao buscar relatório:', error);
        res.status(500).json({ error: 'Erro ao buscar relatório' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: 'ID inválido' });
            return;
        }
        await prisma_1.prisma.relatorio.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao deletar relatório:', error);
        res.status(500).json({ error: 'Erro ao deletar relatório' });
    }
});
exports.default = router;
