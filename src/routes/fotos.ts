import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '@/infrastructure/middleware/auth.middleware';

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

// Add authentication middleware to all photo routes
router.use(authenticateToken);

// 🔹 Upload de novas fotos
router.post('/', upload.single('foto'), async (req: Request, res: Response): Promise<void> => {
  const { ocorrenciaId, legenda, cropX, cropY, zoom, cropArea } = req.body;
  const arquivo = req.file as Express.Multer.File;

  if (!ocorrenciaId) {
    res.status(400).json({ error: 'ocorrenciaId é obrigatório.' });
    return;
  }

  if (!arquivo) {
    res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
    return;
  }

  // Log do caminho do arquivo salvo
  console.log('Arquivo salvo (fotos.ts):', arquivo.path);

  try {
    // Verificar se a ocorrência existe
    const ocorrencia = await prisma.ocorrencia.findUnique({
      where: { id: Number(ocorrenciaId) }
    });

    if (!ocorrencia) {
      res.status(404).json({ error: 'Ocorrência não encontrada.' });
      return;
    }

    const nomeArquivo = arquivo.filename;
    // Garantir que a URL comece com /uploads/
    const url = nomeArquivo.startsWith('uploads/') ? `/${nomeArquivo}` : `/uploads/${nomeArquivo}`;

    // Preparar dados para salvar
    const fotoData: any = {
      url,
      legenda: legenda || '',
      ocorrenciaId: Number(ocorrenciaId)
    };

    // Adicionar campos de crop e zoom se fornecidos
    if (cropX !== undefined) fotoData.cropX = parseFloat(cropX);
    if (cropY !== undefined) fotoData.cropY = parseFloat(cropY);
    if (zoom !== undefined) fotoData.zoom = parseFloat(zoom);
    if (cropArea !== undefined) {
      try {
        fotoData.cropArea = typeof cropArea === 'string' ? JSON.parse(cropArea) : cropArea;
      } catch (e) {
        console.warn('Erro ao parsear cropArea:', e);
      }
    }

    const fotoCriada = await prisma.foto.create({
      data: fotoData
    });

    // Log para debug
    console.log('Foto criada:', fotoCriada);

    res.status(201).json(fotoCriada);
  } catch (error) {
    // Limpar arquivo em caso de erro
    if (arquivo) {
      const filepath = path.join(UPLOAD_DIR, arquivo.filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    console.error('Erro ao salvar foto:', error);
    res.status(500).json({ error: 'Erro ao salvar foto.', detalhes: String(error) });
  }
});

// 🔹 Atualizar foto (legenda, crop e zoom)
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { legenda, cropX, cropY, zoom, cropArea } = req.body;

  if (!legenda || typeof legenda !== 'string') {
    res.status(400).json({ error: 'Legenda inválida.' });
    return;
  }

  try {
    // Preparar dados para atualizar
    const updateData: any = { legenda };

    // Adicionar campos de crop e zoom se fornecidos
    if (cropX !== undefined) updateData.cropX = parseFloat(cropX);
    if (cropY !== undefined) updateData.cropY = parseFloat(cropY);
    if (zoom !== undefined) updateData.zoom = parseFloat(zoom);
    if (cropArea !== undefined) {
      try {
        updateData.cropArea = typeof cropArea === 'string' ? JSON.parse(cropArea) : cropArea;
      } catch (e) {
        console.warn('Erro ao parsear cropArea:', e);
      }
    }

    const fotoAtualizada = await prisma.foto.update({
      where: { id: Number(id) },
      data: updateData
    });

    res.json(fotoAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar foto:', error);
    res.status(500).json({ error: 'Erro ao atualizar foto.', detalhes: String(error) });
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

    // Verificar se os arquivos físicos existem
    const fotosComStatus = fotos.map(foto => {
      const filename = path.basename(foto.url);
      const filepath = path.join(UPLOAD_DIR, filename);
      const arquivoExiste = fs.existsSync(filepath);
      
      return {
        ...foto,
        arquivoExiste,
        erroArquivo: !arquivoExiste ? 'Arquivo físico não encontrado' : null
      };
    });

    res.json(fotosComStatus);
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
    res.status(500).json({ error: 'Erro ao buscar fotos.', detalhes: String(error) });
  }
});

export default router;
