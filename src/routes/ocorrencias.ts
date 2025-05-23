import express, { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const ocorrenciaSchema = z.object({
  placa1: z.string(),
  placa2: z.string().optional(),
  placa3: z.string().optional(),
  modelo1: z.string().optional(),
  cor1: z.string().optional(),
  cliente: z.string(),
  tipo: z.string(),
  tipo_veiculo: z.string().optional(),
  coordenadas: z.string().optional(),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cpf_condutor: z.string().optional(),
  nome_condutor: z.string().optional(),
  transportadora: z.string().optional(),
  valor_carga: z.number().optional(),
  notas_fiscais: z.string().optional(),
  os: z.string().optional(),
  origem_bairro: z.string().optional(),
  origem_cidade: z.string().optional(),
  origem_estado: z.string().optional(),
  prestador: z.string().optional(),
  inicio: z.coerce.date().optional(),
  chegada: z.coerce.date().optional(),
  termino: z.coerce.date().optional(),
  km: z.number().optional(),
  km_inicial: z.number().optional(),
  km_final: z.number().optional(),
  despesas: z.number().optional(),
  despesas_detalhadas: z.array(z.object({ tipo: z.string(), valor: z.number() })).optional(),
  descricao: z.string().optional(),
  fotos: z.array(z.object({ url: z.string(), legenda: z.string().optional() })).optional(),
  resultado: z.string().optional(),
  status: z.string().optional(),
  encerrada_em: z.coerce.date().optional(),
  data_acionamento: z.coerce.date().optional(),
});

// 🔹 Criar nova ocorrência
router.post('/', async (req: Request, res: Response) => {
  try {
    const dados = ocorrenciaSchema.parse(req.body);
    const { fotos, ...dadosSemFotos } = dados;

    const novaOcorrencia = await prisma.ocorrencia.create({ data: dadosSemFotos });

    if (fotos && fotos.length > 0) {
      await prisma.foto.createMany({
        data: fotos.map(f => ({
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
});

// 🔹 Buscar ocorrências com filtros
router.get('/', async (req, res) => {
  const { id, placa, cliente, prestador, inicio, fim } = req.query;

  try {
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

    const formatadas = ocorrencias.map(o => ({
      ...o,
      fotos: o.fotos ?? [],
      tem_fotos: o.fotos?.length > 0,
      despesas_detalhadas: o.despesas_detalhadas ?? [],
      encerradaEm: o.encerrada_em,
      resultado: o.resultado ?? '' // ✅ inclusão explícita do campo
    }));

    res.json(formatadas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ocorrências', detalhes: String(error) });
  }
});


// 🔹 Buscar ocorrência por ID
router.get('/:id', async (req, res) => {
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
  resultado: true // ✅ necessário aqui
}

    });

    if (!ocorrencia) return res.status(404).json({ error: 'Ocorrência não encontrada' });

    res.json({ ...ocorrencia, encerradaEm: ocorrencia.encerrada_em });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar ocorrência.' });
  }
});

// 🔹 Buscar somente encerradas
router.get('/encerradas', async (_req, res) => {
  try {
    const encerradas = await prisma.ocorrencia.findMany({
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
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(Number(id))) return res.status(400).json({ error: 'ID inválido' });

  try {
    const dados = ocorrenciaSchema.partial().parse(req.body);
    const { fotos, ...dadosSemFotos } = dados;

    const atualizada = await prisma.ocorrencia.update({
      where: { id: Number(id) },
      data: dadosSemFotos
    });

    if (fotos) {
      await prisma.foto.deleteMany({ where: { ocorrenciaId: Number(id) } });
      await prisma.foto.createMany({
        data: fotos.map(f => ({
          url: f.url,
          legenda: f.legenda ?? '',
          ocorrenciaId: Number(id)
        }))
      });
    }

    res.json({ ...atualizada, encerradaEm: atualizada.encerrada_em });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar ocorrência', detalhes: String(error) });
  }
});

// 🔹 Encerrar ocorrência
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



export default router;
