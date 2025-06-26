"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = __importDefault(require("../lib/db"));
const UPLOAD_DIR = path_1.default.resolve(__dirname, '../../uploads');
// Garantir que a pasta uploads existe
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const ext = path_1.default.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `${uniqueSuffix}${ext}`);
    }
});
// Configuração do Multer com validações
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024,
        files: 10 // máximo de 10 arquivos por vez
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo inválido. Apenas JPG, PNG e GIF são permitidos.'));
        }
    }
});
const router = express_1.default.Router();
// 🔹 Upload de novas fotos
router.post('/', upload.array('imagens'), async (req, res) => {
    const { ocorrenciaId } = req.body;
    const arquivos = req.files;
    const legendas = Array.isArray(req.body.legendas) ? req.body.legendas : [req.body.legendas];
    if (!ocorrenciaId) {
        return res.status(400).json({ error: 'ocorrenciaId é obrigatório.' });
    }
    if (!arquivos || arquivos.length === 0) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
    }
    try {
        // Verificar se a ocorrência existe
        const ocorrencia = await db_1.default.ocorrencia.findUnique({
            where: { id: Number(ocorrenciaId) }
        });
        if (!ocorrencia) {
            return res.status(404).json({ error: 'Ocorrência não encontrada.' });
        }
        const fotosCriadas = await Promise.all(arquivos.map(async (file, i) => {
            const nomeArquivo = file.filename;
            // Garantir que a URL comece com /uploads/
            const url = nomeArquivo.startsWith('uploads/') ? `/${nomeArquivo}` : `/uploads/${nomeArquivo}`;
            return db_1.default.foto.create({
                data: {
                    url,
                    legenda: legendas[i] || '',
                    ocorrenciaId: Number(ocorrenciaId)
                }
            });
        }));
        // Log para debug
        console.log('Fotos criadas:', fotosCriadas);
        res.status(201).json(fotosCriadas);
    }
    catch (error) {
        // Limpar arquivos em caso de erro
        arquivos.forEach(file => {
            const filepath = path_1.default.join(UPLOAD_DIR, file.filename);
            if (fs_1.default.existsSync(filepath)) {
                fs_1.default.unlinkSync(filepath);
            }
        });
        console.error('Erro ao salvar fotos:', error);
        res.status(500).json({ error: 'Erro ao salvar fotos.', detalhes: String(error) });
    }
});
// 🔹 Atualizar legenda da foto
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { legenda } = req.body;
    if (!legenda || typeof legenda !== 'string') {
        return res.status(400).json({ error: 'Legenda inválida.' });
    }
    try {
        const fotoAtualizada = await db_1.default.foto.update({
            where: { id: Number(id) },
            data: { legenda }
        });
        res.json(fotoAtualizada);
    }
    catch (error) {
        console.error('Erro ao atualizar legenda:', error);
        res.status(500).json({ error: 'Erro ao atualizar legenda da foto.', detalhes: String(error) });
    }
});
// 🔹 Remover foto
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const foto = await db_1.default.foto.findUnique({ where: { id: Number(id) } });
        if (!foto) {
            return res.status(404).json({ error: 'Foto não encontrada.' });
        }
        // Remover arquivo físico
        if (foto.url) {
            const filename = path_1.default.basename(foto.url);
            const filepath = path_1.default.join(UPLOAD_DIR, filename);
            if (fs_1.default.existsSync(filepath)) {
                fs_1.default.unlinkSync(filepath);
            }
        }
        await db_1.default.foto.delete({ where: { id: Number(id) } });
        res.status(204).send();
    }
    catch (error) {
        console.error('Erro ao deletar foto:', error);
        res.status(500).json({ error: 'Erro ao deletar foto.', detalhes: String(error) });
    }
});
// 🔹 Listar fotos por ocorrência
router.get('/por-ocorrencia/:ocorrenciaId', async (req, res) => {
    const { ocorrenciaId } = req.params;
    if (!ocorrenciaId || isNaN(Number(ocorrenciaId))) {
        return res.status(400).json({ error: 'ID de ocorrência inválido.' });
    }
    try {
        const fotos = await db_1.default.foto.findMany({
            where: { ocorrenciaId: Number(ocorrenciaId) },
            orderBy: { id: 'asc' }
        });
        res.json(fotos);
    }
    catch (error) {
        console.error('Erro ao buscar fotos:', error);
        res.status(500).json({ error: 'Erro ao buscar fotos.', detalhes: String(error) });
    }
});
exports.default = router;
//# sourceMappingURL=fotos.js.map