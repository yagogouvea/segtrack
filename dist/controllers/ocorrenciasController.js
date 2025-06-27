"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletarOcorrencia = void 0;
const prisma_1 = require("../lib/prisma");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const deletarOcorrencia = async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ error: 'ID inválido' });
        return;
    }
    try {
        const db = await (0, prisma_1.ensurePrisma)();
        // Primeiro, buscar a ocorrência para obter as fotos
        const ocorrencia = await db.ocorrencia.findUnique({
            where: { id: Number(id) },
            include: { fotos: true }
        });
        if (!ocorrencia) {
            res.status(404).json({ error: 'Ocorrência não encontrada' });
            return;
        }
        // Deletar os arquivos físicos das fotos
        for (const foto of ocorrencia.fotos) {
            const caminhoFoto = path_1.default.join(__dirname, '../../', foto.url);
            if (fs_1.default.existsSync(caminhoFoto)) {
                fs_1.default.unlinkSync(caminhoFoto);
            }
        }
        // Deletar a ocorrência (isso também deletará as fotos devido ao onDelete: Cascade)
        await db.ocorrencia.delete({
            where: { id: Number(id) }
        });
        res.json({ message: 'Ocorrência deletada com sucesso' });
    }
    catch (error) {
        console.error('Erro ao deletar ocorrência:', error);
        res.status(500).json({
            error: 'Erro ao deletar ocorrência',
            details: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
    }
};
exports.deletarOcorrencia = deletarOcorrencia;
