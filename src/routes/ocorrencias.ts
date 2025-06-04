import express, { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Ocorrencia, Foto, OcorrenciaFormatada } from '../types/ocorrencia';
import { authenticateToken, requirePermission, AuthRequest, createAuthenticatedHandler } from '../middleware/authMiddleware';
import { sanitizeResponseData } from '../middleware/dataSanitizer';
import * as ocorrenciasController from '../controllers/ocorrenciasController';
import { ocorrenciaSchema } from '../schemas/ocorrenciaSchema';

const router = express.Router();

// Garantir que o diretório de uploads existe
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Diretório de uploads criado:', uploadsDir);
  } catch (error) {
    console.error('Erro ao criar diretório de uploads:', error);
  }
}

const upload = multer({ dest: 'uploads/' });

// Aplicar autenticação e sanitização para todas as rotas de ocorrências
router.use(authenticateToken);
router.use(sanitizeResponseData());

// 🔹 Atualizar apenas o resultado da ocorrência
router.put('/:id/resultado', async (req, res) => {
  const { id } = req.params;
  const { resultado } = req.body;

  if (isNaN(Number(id))) return res.status(400).json({ error: 'ID inválido' });

  const opcoesValidas = ['Recuperado', 'Não Recuperado', 'Cancelado'];
  if (!resultado || !opcoesValidas.includes(resultado)) {
    return res.status(400).json({ error: 'Resultado inválido ou ausente.' });
  }

  try {
    const atualizada = await prisma.ocorrencia.update({
      where: { id: Number(id) },
      data: { resultado }
    });

    res.json({ mensagem: 'Resultado atualizado com sucesso', resultado: atualizada.resultado });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar resultado.' });
  }
});

// 🔹 Buscar apenas o resultado da ocorrência
router.get('/:id/resultado', async (req, res) => {
  const { id } = req.params;
  if (isNaN(Number(id))) return res.status(400).json({ error: 'ID inválido' });

  try {
    const ocorrencia = await prisma.ocorrencia.findUnique({
      where: { id: Number(id) },
      select: { resultado: true }
    });

    if (!ocorrencia) return res.status(404).json({ error: 'Ocorrência não encontrada' });

    res.json({ resultado: ocorrencia.resultado });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar resultado.' });
  }
});

// 🔹 Encerrar ocorrência (com resultado)
router.post('/:id/encerrar', async (req, res) => {
  const { id } = req.params;
  const { resultado } = req.body;

  if (isNaN(Number(id))) return res.status(400).json({ error: 'ID inválido' });

  if (!resultado || resultado.trim() === '') {
    return res.status(400).json({ error: 'O campo resultado é obrigatório ao encerrar.' });
  }

  try {
    const encerrada = await prisma.ocorrencia.update({
      where: { id: Number(id) },
      data: {
        status: 'encerrada',
        encerrada_em: new Date(),
        resultado: resultado.trim()
      },
      include: { fotos: true }
    });

    res.json({ ...encerrada, encerradaEm: encerrada.encerrada_em });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao encerrar ocorrência.' });
  }
});

// 🔹 Criar nova ocorrência
router.post('/',
  requirePermission('ocorrencias:create'),
  createAuthenticatedHandler(async (req: AuthRequest, res: Response) => {
    try {
      const dados = ocorrenciaSchema.parse(req.body);
      const { fotos, ...dadosSemFotos } = dados;

      const novaOcorrencia = await prisma.ocorrencia.create({ data: dadosSemFotos });

      if (fotos && fotos.length > 0) {
        await prisma.foto.createMany({
          data: fotos.map((f: { url: string; legenda?: string }) => ({
            url: f.url,
            legenda: f.legenda ?? '',
            ocorrenciaId: novaOcorrencia.id
          }))
        });
      }

      res.status(201).json(novaOcorrencia);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar ocorrência', detalhes: String(error) });
    }
  })
);

// 🔹 Buscar ocorrências com filtros
router.get('/', 
  requirePermission('ocorrencias:read'),
  createAuthenticatedHandler(async (req: AuthRequest, res: Response) => {
    const { id, placa, cliente, prestador, inicio, fim } = req.query;

    try {
      console.log('Iniciando busca de ocorrências com filtros:', { id, placa, cliente, prestador, inicio, fim });
      
      // Test database connection before proceeding
      const isConnected = await prisma.$queryRaw`SELECT 1`;
      if (!isConnected) {
        console.error('❌ Falha na conexão com o banco de dados');
        return res.status(500).json({ 
          error: 'Erro de conexão com o banco de dados',
          details: process.env.NODE_ENV === 'development' ? 'Database connection failed' : undefined
        });
      }

      const ocorrencias = await prisma.ocorrencia.findMany({
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

      console.log(`✅ Encontradas ${ocorrencias.length} ocorrências`);

      const formatarData = (data: Date | null) =>
        data ? new Date(data).toISOString().slice(0, 16) : null;

      const formatadas = ocorrencias.map((o: Ocorrencia): OcorrenciaFormatada => ({
        ...o,
        fotos: o.fotos ?? [],
        tem_fotos: (o.fotos && o.fotos.length > 0) || false,
        despesas_detalhadas: o.despesas_detalhadas ?? [],
        encerradaEm: o.encerrada_em,
        resultado: o.resultado ?? '',
        inicio: formatarData(o.inicio || null),
        chegada: formatarData(o.chegada || null),
        termino: formatarData(o.termino || null)
      }));

      console.log('✅ Ocorrências formatadas com sucesso');
      res.json(formatadas);
    } catch (error) {
      console.error('❌ Erro detalhado ao buscar ocorrências:', {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        message: error instanceof Error ? error.message : String(error),
        query: req.query
      });

      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('connect ECONNREFUSED')) {
          return res.status(500).json({
            error: 'Erro de conexão com o banco de dados',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
        
        if (error.message.includes('Prisma Client')) {
          return res.status(500).json({
            error: 'Erro no cliente Prisma',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      }

      res.status(500).json({ 
        error: 'Erro ao buscar ocorrências',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      });
    }
  })
);

// 🔹 Buscar ocorrência por ID
router.get('/:id',
  requirePermission('ocorrencias:read'),
  createAuthenticatedHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    if (isNaN(Number(id))) return res.status(400).json({ error: 'ID inválido' });

    try {
      const ocorrencia = await prisma.ocorrencia.findUnique({
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

      if (!ocorrencia) return res.status(404).json({ error: 'Ocorrência não encontrada' });

      res.json({ ...ocorrencia, encerradaEm: ocorrencia.encerrada_em });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar ocorrência.' });
    }
  })
);

// 🔹 Buscar somente encerradas
router.get('/encerradas', async (_req, res) => {
  try {
    const encerradas = await prisma.ocorrencia.findMany({
      where: { status: 'encerrada' },
      orderBy: { encerrada_em: 'desc' },
      include: { fotos: true }
    });

    const formatadas = encerradas.map((o: Ocorrencia): OcorrenciaFormatada => ({
      ...o,
      fotos: o.fotos ?? [],
      tem_fotos: (o.fotos && o.fotos.length > 0) || false,
      despesas_detalhadas: o.despesas_detalhadas ?? [],
      encerradaEm: o.encerrada_em,
      inicio: o.inicio ? new Date(o.inicio).toISOString().slice(0, 16) : null,
      chegada: o.chegada ? new Date(o.chegada).toISOString().slice(0, 16) : null,
      termino: o.termino ? new Date(o.termino).toISOString().slice(0, 16) : null
    }));

    res.json(formatadas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar encerradas', detalhes: String(error) });
  }
});

// 🔹 Enviar fotos
router.post('/:id/fotos', upload.array('imagens'), async (req, res) => {
  const { id } = req.params;
  const { legendas } = req.body;
  const arquivos = req.files as Express.Multer.File[];

  try {
    const listaDeLegendas = Array.isArray(legendas) ? legendas : [legendas];

    const fotosCriadas = await Promise.all(
      arquivos.map((file, i) => {
        const extensao = path.extname(file.originalname) || '.jpg';
        const nomeArquivo = `${Date.now()}-${Math.random().toString(36).substring(2)}${extensao}`;
        const caminho = path.join('uploads', nomeArquivo);
        fs.renameSync(file.path, caminho);
        const url = `/uploads/${nomeArquivo}`;
        return prisma.foto.create({
          data: {
            url,
            legenda: listaDeLegendas[i] || '',
            ocorrenciaId: Number(id),
          },
        });
      })
    );

    res.json(fotosCriadas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar fotos.' });
  }
});

// 🔹 Atualizar ocorrência
router.put('/:id',
  requirePermission('ocorrencias:update'),
  async (req, res) => {
  const { id } = req.params;
  if (isNaN(Number(id))) return res.status(400).json({ error: 'ID inválido' });

  try {
    const dados = ocorrenciaSchema.partial().parse(req.body);
    const { fotos, ...dadosSemFotos } = dados;

    const atualizada = await prisma.ocorrencia.update({
      where: { id: Number(id) },
      data: dadosSemFotos,
      include: { fotos: true }
    });

    if (fotos) {
      await prisma.foto.deleteMany({ where: { ocorrenciaId: Number(id) } });
      await prisma.foto.createMany({
        data: (fotos as { url: string; legenda?: string }[]).map(f => ({
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
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar ocorrência', detalhes: String(error) });
  }
});

// Deletar ocorrência
router.delete('/:id',
  requirePermission('ocorrencias:delete'),
  ocorrenciasController.deletarOcorrencia
);

export default router;
