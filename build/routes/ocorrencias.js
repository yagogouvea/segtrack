"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const db_1 = require("../lib/db");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// 🔹 Atualizar apenas o resultado da ocorrência
router.put('/:id/resultado', async (req, res) => {
    const { id } = req.params;
    const { resultado } = req.body;
    if (isNaN(Number(id)))
        return res.status(400).json({ error: 'ID inválido' });
    const opcoesValidas = ['Recuperado', 'Não Recuperado', 'Cancelado'];
    if (!resultado || !opcoesValidas.includes(resultado)) {
        return res.status(400).json({ error: 'Resultado inválido ou ausente.' });
    }
    try {
        const atualizada = await db_1.prisma.ocorrencia.update({
            where: { id: Number(id) },
            data: { resultado }
        });
        res.json({ mensagem: 'Resultado atualizado com sucesso', resultado: atualizada.resultado });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar resultado.' });
    }
});
// 🔹 Buscar apenas o resultado da ocorrência
router.get('/:id/resultado', async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id)))
        return res.status(400).json({ error: 'ID inválido' });
    try {
        const ocorrencia = await db_1.prisma.ocorrencia.findUnique({
            where: { id: Number(id) },
            select: { resultado: true }
        });
        if (!ocorrencia)
            return res.status(404).json({ error: 'Ocorrência não encontrada' });
        res.json({ resultado: ocorrencia.resultado });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar resultado.' });
    }
});
const ocorrenciaSchema = zod_1.z.object({
    placa1: zod_1.z.string(),
    placa2: zod_1.z.string().optional(),
    placa3: zod_1.z.string().optional(),
    modelo1: zod_1.z.string().optional(),
    cor1: zod_1.z.string().optional(),
    cliente: zod_1.z.string(),
    tipo: zod_1.z.string(),
    tipo_veiculo: zod_1.z.string().optional(),
    coordenadas: zod_1.z.string().optional(),
    endereco: zod_1.z.string().optional(),
    bairro: zod_1.z.string().optional(),
    cidade: zod_1.z.string().optional(),
    estado: zod_1.z.string().optional(),
    cpf_condutor: zod_1.z.string().optional(),
    nome_condutor: zod_1.z.string().optional(),
    transportadora: zod_1.z.string().optional(),
    valor_carga: zod_1.z.number().optional(),
    notas_fiscais: zod_1.z.string().optional(),
    os: zod_1.z.string().optional(),
    origem_bairro: zod_1.z.string().optional(),
    origem_cidade: zod_1.z.string().optional(),
    origem_estado: zod_1.z.string().optional(),
    prestador: zod_1.z.string().optional(),
    inicio: zod_1.z.coerce.date().optional(),
    chegada: zod_1.z.coerce.date().optional(),
    termino: zod_1.z.coerce.date().optional(),
    km: zod_1.z.number().optional(),
    km_inicial: zod_1.z.number().optional(),
    km_final: zod_1.z.number().optional(),
    despesas: zod_1.z.number().optional(),
    despesas_detalhadas: zod_1.z.array(zod_1.z.object({ tipo: zod_1.z.string(), valor: zod_1.z.number() })).optional(),
    descricao: zod_1.z.string().optional(),
    fotos: zod_1.z.array(zod_1.z.object({ url: zod_1.z.string(), legenda: zod_1.z.string().optional() })).optional(),
    resultado: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    encerrada_em: zod_1.z.coerce.date().optional(),
    data_acionamento: zod_1.z.coerce.date().optional(),
});
// 🔹 Encerrar ocorrência (com resultado)
router.post('/:id/encerrar', async (req, res) => {
    const { id } = req.params;
    const { resultado } = req.body;
    if (isNaN(Number(id)))
        return res.status(400).json({ error: 'ID inválido' });
    if (!resultado || resultado.trim() === '') {
        return res.status(400).json({ error: 'O campo resultado é obrigatório ao encerrar.' });
    }
    try {
        const encerrada = await db_1.prisma.ocorrencia.update({
            where: { id: Number(id) },
            data: {
                status: 'encerrada',
                encerrada_em: new Date(),
                resultado: resultado.trim()
            },
            include: { fotos: true }
        });
        res.json({ ...encerrada, encerradaEm: encerrada.encerrada_em });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao encerrar ocorrência.' });
    }
});
// 🔹 Criar nova ocorrência
router.post('/', async (req, res) => {
    try {
        const dados = ocorrenciaSchema.parse(req.body);
        const { fotos, ...dadosSemFotos } = dados;
        const novaOcorrencia = await db_1.prisma.ocorrencia.create({ data: dadosSemFotos });
        if (fotos && fotos.length > 0) {
            await db_1.prisma.foto.createMany({
                data: fotos.map(f => ({
                    url: f.url,
                    legenda: f.legenda ?? '',
                    ocorrenciaId: novaOcorrencia.id
                }))
            });
        }
        res.status(201).json(novaOcorrencia);
    }
    catch (error) {
        res.status(400).json({ error: 'Erro ao criar ocorrência', detalhes: String(error) });
    }
});
// 🔹 Buscar ocorrências com filtros
router.get('/', async (req, res) => {
    const { id, placa, cliente, prestador, inicio, fim } = req.query;
    try {
        const ocorrencias = await db_1.prisma.ocorrencia.findMany({
            where: {
                ...(id ? { id: Number(id) } : {}),
                ...(placa ? { placa1: { contains: String(placa) } } : {}),
                ...(cliente ? { cliente: { contains: String(cliente) } } : {}),
                ...(prestador ? { prestador: { contains: String(prestador) } } : {}),
                ...(inicio || fim
                    ? {
                        data_acionamento: {
                            gte: inicio ? new Date(String(inicio)) : undefined,
                            lte: fim ? new Date(String(fim)) : undefined,
                        }
                    }
                    : {})
            },
            orderBy: { criado_em: 'desc' },
            include: {
                fotos: true
            }
        });
        const formatarData = (data) => data ? new Date(data).toISOString().slice(0, 16) : null;
        const formatadas = ocorrencias.map(o => ({
            ...o,
            fotos: o.fotos ?? [],
            tem_fotos: o.fotos?.length > 0,
            despesas_detalhadas: o.despesas_detalhadas ?? [],
            encerradaEm: o.encerrada_em,
            resultado: o.resultado ?? '',
            inicio: formatarData(o.inicio),
            chegada: formatarData(o.chegada),
            termino: formatarData(o.termino)
        }));
        res.json(formatadas);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar ocorrências', detalhes: String(error) });
    }
});
// 🔹 Buscar ocorrência por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id)))
        return res.status(400).json({ error: 'ID inválido' });
    try {
        const ocorrencia = await db_1.prisma.ocorrencia.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                placa1: true,
                cliente: true,
                tipo: true,
                prestador: true,
                inicio: true,
                chegada: true,
                termino: true,
                km: true,
                km_inicial: true,
                km_final: true,
                despesas: true,
                despesas_detalhadas: true,
                descricao: true,
                fotos: true,
                encerrada_em: true,
                data_acionamento: true,
                os: true,
                modelo1: true,
                cor1: true,
                estado: true,
                cidade: true,
                bairro: true,
                origem_estado: true,
                origem_cidade: true,
                origem_bairro: true,
                resultado: true
            }
        });
        if (!ocorrencia)
            return res.status(404).json({ error: 'Ocorrência não encontrada' });
        res.json({ ...ocorrencia, encerradaEm: ocorrencia.encerrada_em });
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar ocorrência.' });
    }
});
// 🔹 Buscar somente encerradas
router.get('/encerradas', async (_req, res) => {
    try {
        const encerradas = await db_1.prisma.ocorrencia.findMany({
            where: { status: 'encerrada' },
            orderBy: { encerrada_em: 'desc' },
            include: { fotos: true }
        });
        const formatadas = encerradas.map(o => ({
            ...o,
            fotos: o.fotos ?? [],
            tem_fotos: o.fotos?.length > 0,
            despesas_detalhadas: o.despesas_detalhadas ?? [],
            encerradaEm: o.encerrada_em
        }));
        res.json(formatadas);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao buscar encerradas', detalhes: String(error) });
    }
});
// 🔹 Enviar fotos
router.post('/:id/fotos', upload.array('imagens'), async (req, res) => {
    const { id } = req.params;
    const { legendas } = req.body;
    const arquivos = req.files;
    try {
        const listaDeLegendas = Array.isArray(legendas) ? legendas : [legendas];
        const fotosCriadas = await Promise.all(arquivos.map((file, i) => {
            const extensao = path_1.default.extname(file.originalname) || '.jpg';
            const nomeArquivo = `${Date.now()}-${Math.random().toString(36).substring(2)}${extensao}`;
            const caminho = path_1.default.join('uploads', nomeArquivo);
            fs_1.default.renameSync(file.path, caminho);
            const url = `/uploads/${nomeArquivo}`;
            return db_1.prisma.foto.create({
                data: {
                    url,
                    legenda: listaDeLegendas[i] || '',
                    ocorrenciaId: Number(id),
                },
            });
        }));
        res.json(fotosCriadas);
    }
    catch (error) {
        res.status(500).json({ error: 'Erro ao salvar fotos.' });
    }
});
// 🔹 Atualizar ocorrência
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id)))
        return res.status(400).json({ error: 'ID inválido' });
    try {
        const dados = ocorrenciaSchema.partial().parse(req.body);
        const { fotos, ...dadosSemFotos } = dados;
        const atualizada = await db_1.prisma.ocorrencia.update({
            where: { id: Number(id) },
            data: dadosSemFotos
        });
        if (fotos) {
            await db_1.prisma.foto.deleteMany({ where: { ocorrenciaId: Number(id) } });
            await db_1.prisma.foto.createMany({
                data: fotos.map(f => ({
                    url: f.url,
                    legenda: f.legenda ?? '',
                    ocorrenciaId: Number(id)
                }))
            });
        }
        res.json({
            ...atualizada,
            encerradaEm: atualizada.encerrada_em,
            resultado: atualizada.resultado // ← garante que resultado siga visível após updates
        });
    }
    catch (error) {
        res.status(400).json({ error: 'Erro ao atualizar ocorrência', detalhes: String(error) });
    }
});
exports.default = router;
