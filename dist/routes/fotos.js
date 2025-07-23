"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
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
        fileSize: 50 * 1024 * 1024, // 50MB
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
// Add authentication middleware to all photo routes
// router.use(authenticateToken); // TEMPORARIAMENTE COMENTADO PARA TESTE
// Rota de teste sem autenticação
router.get('/test', (req, res) => {
    console.log('[fotos] Rota de teste acessada');
    res.json({ message: 'Rota de fotos funcionando!' });
});
// 🔹 Upload de novas fotos
router.post('/', async (req, res) => {
    try {
        const { url, legenda, ocorrenciaId, cropX, cropY, zoom, cropArea } = req.body;
        if (!url || !ocorrenciaId) {
            return res.status(400).json({ error: 'URL e ocorrenciaId são obrigatórios.' });
        }
        // Proteção: não criar duplicada
        const fotoExistente = await prisma.foto.findFirst({
            where: { url, ocorrenciaId: Number(ocorrenciaId) }
        });
        if (fotoExistente) {
            return res.status(200).json(fotoExistente);
        }
        const data = {
            url,
            legenda: legenda || '',
            ocorrenciaId: Number(ocorrenciaId)
        };
        if (cropX !== undefined)
            data.cropX = parseFloat(cropX);
        if (cropY !== undefined)
            data.cropY = parseFloat(cropY);
        if (zoom !== undefined)
            data.zoom = parseFloat(zoom);
        if (cropArea !== undefined) {
            try {
                data.cropArea = typeof cropArea === 'string' ? JSON.parse(cropArea) : cropArea;
            }
            catch (e) {
                console.warn('Erro ao parsear cropArea:', e);
            }
        }
        const fotoCriada = await prisma.foto.create({
            data
        });
        res.status(201).json(fotoCriada);
    }
    catch (error) {
        console.error('Erro ao salvar foto:', error);
        res.status(500).json({ error: 'Erro ao salvar foto.', detalhes: String(error) });
    }
});
// 🔹 Upload de fotos via multipart/form-data (fallback para quando Supabase não estiver disponível)
router.post('/upload', upload.single('foto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
        }
        const { legenda, ocorrenciaId } = req.body;
        if (!ocorrenciaId) {
            return res.status(400).json({ error: 'ocorrenciaId é obrigatório.' });
        }
        // Criar URL relativa para o arquivo salvo
        const filename = req.file.filename;
        const url = `/api/uploads/${filename}`;
        const fotoCriada = await prisma.foto.create({
            data: {
                url,
                legenda: legenda || '',
                ocorrenciaId: Number(ocorrenciaId)
            }
        });
        res.status(201).json(Object.assign(Object.assign({}, fotoCriada), { url: `${req.protocol}://${req.get('host')}${url}` // URL completa
         }));
    }
    catch (error) {
        console.error('Erro ao fazer upload de foto:', error);
        res.status(500).json({ error: 'Erro ao fazer upload de foto.', detalhes: String(error) });
    }
});
// 🔹 Atualizar foto (legenda, crop e zoom)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { legenda, cropX, cropY, zoom, cropArea } = req.body;
    // Permitir legenda vazia ou null, mas deve ser string se fornecida
    if (legenda !== undefined && legenda !== null && typeof legenda !== 'string') {
        res.status(400).json({ error: 'Legenda deve ser uma string.' });
        return;
    }
    try {
        // Preparar dados para atualizar
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
            }
            catch (e) {
                console.warn('Erro ao parsear cropArea:', e);
            }
        }
        const fotoAtualizada = await prisma.foto.update({
            where: { id: Number(id) },
            data: updateData
        });
        res.json(fotoAtualizada);
    }
    catch (error) {
        console.error('Erro ao atualizar foto:', error);
        res.status(500).json({ error: 'Erro ao atualizar foto.', detalhes: String(error) });
    }
});
// 🔹 Remover foto
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const foto = await prisma.foto.findUnique({ where: { id: Number(id) } });
        if (!foto) {
            res.status(404).json({ error: 'Foto não encontrada.' });
            return;
        }
        // Remover arquivo físico apenas se for uma foto local
        if (foto.url && !foto.url.startsWith('http')) {
            const filename = path_1.default.basename(foto.url);
            const filepath = path_1.default.join(UPLOAD_DIR, filename);
            if (fs_1.default.existsSync(filepath)) {
                fs_1.default.unlinkSync(filepath);
            }
        }
        await prisma.foto.delete({ where: { id: Number(id) } });
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
        res.status(400).json({ error: 'ID de ocorrência inválido.' });
        return;
    }
    try {
        const fotos = await prisma.foto.findMany({
            where: { ocorrenciaId: Number(ocorrenciaId) },
            orderBy: { id: 'asc' }
        });
        // Para fotos do Supabase, não precisamos verificar arquivos físicos
        const fotosProcessadas = fotos.map(foto => {
            let url = foto.url;
            // Se a URL é do Supabase, não modificar
            if (url.startsWith('http') && url.includes('supabase')) {
                return Object.assign(Object.assign({}, foto), { arquivoExiste: true, erroArquivo: null });
            }
            // Se a URL é absoluta mas aponta para o backend local, transformar em relativa
            if (url.startsWith('http') && url.includes('/api/uploads/')) {
                const idx = url.indexOf('/api/uploads/');
                url = url.substring(idx);
            }
            // Para fotos locais, verificar se o arquivo existe
            const filename = path_1.default.basename(url);
            const filepath = path_1.default.join(UPLOAD_DIR, filename);
            const arquivoExiste = fs_1.default.existsSync(filepath);
            return Object.assign(Object.assign({}, foto), { url, // sempre relativa para fotos locais
                arquivoExiste, erroArquivo: !arquivoExiste ? 'Arquivo físico não encontrado' : null });
        });
        res.json(fotosProcessadas);
    }
    catch (error) {
        console.error('Erro ao buscar fotos:', error);
        res.status(500).json({ error: 'Erro ao buscar fotos.', detalhes: String(error) });
    }
});
exports.default = router;
