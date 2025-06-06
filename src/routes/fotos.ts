import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

// Garantir que a pasta uploads existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// Configuração do Multer com validações
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // máximo de 10 arquivos por vez
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Apenas JPG, PNG e GIF são permitidos.'));
    }
  }
});

const router = express.Router();

// 🔹 Upload de novas fotos
router.post('/', upload.array('imagens'), async (req: Request, res: Response): Promise<void> => {
  const { ocorrenciaId } = req.body;
  const arquivos = req.files as Express.Multer.File[];
  const legendas = Array.isArray(req.body.legendas) ? req.body.legendas : [req.body.legendas];

  if (!ocorrenciaId) {
    res.status(400).json({ error: 'ocorrenciaId é obrigatório.' });
    return;
  }

  if (!arquivos || arquivos.length === 0) {
    res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
    return;
  }

  try {
    // Verificar se a ocorrência existe
    const ocorrencia = await prisma.ocorrencia.findUnique({
      where: { id: Number(ocorrenciaId) }
    });

    if (!ocorrencia) {
      res.status(404).json({ error: 'Ocorrência não encontrada.' });
      return;
    }

    const fotosCriadas = await Promise.all(
      arquivos.map(async (file, i) => {
        const nomeArquivo = file.filename;
        // Garantir que a URL comece com /uploads/
        const url = nomeArquivo.startsWith('uploads/') ? `/${nomeArquivo}` : `/uploads/${nomeArquivo}`;

        return prisma.foto.create({
          data: {
            url,
            legenda: legendas[i] || '',
            ocorrenciaId: Number(ocorrenciaId)
          }
        });
      })
    );

    // Log para debug
    console.log('Fotos criadas:', fotosCriadas);

    res.status(201).json(fotosCriadas);
  } catch (error) {
    // Limpar arquivos em caso de erro
    arquivos.forEach(file => {
      const filepath = path.join(UPLOAD_DIR, file.filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    });

    console.error('Erro ao salvar fotos:', error);
    res.status(500).json({ error: 'Erro ao salvar fotos.', detalhes: String(error) });
  }
});

// 🔹 Atualizar legenda da foto
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { legenda } = req.body;

  if (!legenda || typeof legenda !== 'string') {
    res.status(400).json({ error: 'Legenda inválida.' });
    return;
  }

  try {
    const fotoAtualizada = await prisma.foto.update({
      where: { id: Number(id) },
      data: { legenda }
    });

    res.json(fotoAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar legenda:', error);
    res.status(500).json({ error: 'Erro ao atualizar legenda da foto.', detalhes: String(error) });
  }
});

// 🔹 Remover foto
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const foto = await prisma.foto.findUnique({ where: { id: Number(id) } });

    if (!foto) {
      res.status(404).json({ error: 'Foto não encontrada.' });
      return;
    }

    // Remover arquivo físico
    if (foto.url) {
      const filename = path.basename(foto.url);
      const filepath = path.join(UPLOAD_DIR, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    await prisma.foto.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    res.status(500).json({ error: 'Erro ao deletar foto.', detalhes: String(error) });
  }
});

// 🔹 Listar fotos por ocorrência
router.get('/por-ocorrencia/:ocorrenciaId', async (req: Request, res: Response): Promise<void> => {
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

    res.json(fotos);
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
    res.status(500).json({ error: 'Erro ao buscar fotos.', detalhes: String(error) });
  }
});

export default router;
