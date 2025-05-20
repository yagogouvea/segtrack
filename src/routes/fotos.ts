import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/db';

const router = express.Router();

// Cria a pasta uploads se não existir
const uploadFolder = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadFolder),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

/**
 * GET /api/ocorrencias/:id/fotos
 */
router.get('/:id/fotos', async (req: Request, res: Response) => {
  const ocorrenciaId = Number(req.params.id);

  try {
    const fotos = await prisma.foto.findMany({
      where: { ocorrenciaId },
      orderBy: { createdAt: 'asc' }
    });

    const fotosComUrlCompleta = fotos.map(f => ({
      ...f,
      url: `http://localhost:3001${f.url}`
    }));

    res.json(fotosComUrlCompleta);
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
    res.status(500).json({ error: 'Erro ao buscar fotos' });
  }
});

/**
 * POST /api/ocorrencias/:id/fotos
 */
router.post('/:id/fotos', upload.array('imagens'), async (req: Request, res: Response) => {
  const ocorrenciaId = Number(req.params.id);
  const raw = req.body.legendas;
  const legendas = Array.isArray(raw) ? raw : raw ? [raw] : [];

  if (!req.files || !Array.isArray(req.files)) {
    return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
  }

  try {
    const imagens = req.files as Express.Multer.File[];

    await Promise.all(imagens.map((file, index) => {
      const url = `/uploads/${file.filename}`;
      return prisma.foto.create({
        data: {
          url,
          legenda: legendas[index] || '',
          ocorrenciaId,
        }
      });
    }));

    const ocorrenciaAtualizada = await prisma.ocorrencia.findUnique({
      where: { id: ocorrenciaId },
      include: { fotos: true }
    });

    const fotosFinal = ocorrenciaAtualizada?.fotos.map(f => ({
      ...f,
      url: `http://localhost:3001${f.url}`
    })) ?? [];

    res.status(201).json({
      ...ocorrenciaAtualizada,
      fotos: fotosFinal,
      tem_fotos: fotosFinal.length > 0
    });
  } catch (error) {
    console.error('Erro ao salvar fotos:', error);
    res.status(500).json({ error: 'Erro ao salvar fotos' });
  }
});

/**
 * PUT /api/fotos/:id - Atualizar legenda de uma foto
 */
router.put('/:id', async (req: Request, res: Response) => {
  const fotoId = Number(req.params.id);
  const { legenda } = req.body;

  try {
    const atualizada = await prisma.foto.update({
      where: { id: fotoId },
      data: { legenda }
    });

    res.json(atualizada);
  } catch (error) {
    console.error('Erro ao atualizar legenda:', error);
    res.status(500).json({ error: 'Erro ao atualizar legenda' });
  }
});

/**
 * DELETE /api/fotos/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const fotoId = Number(req.params.id);

  try {
    const foto = await prisma.foto.findUnique({ where: { id: fotoId } });

    if (foto?.url) {
      const filePath = path.join(uploadFolder, path.basename(foto.url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.foto.delete({ where: { id: fotoId } });

    res.status(200).json({ message: 'Foto removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    res.status(500).json({ error: 'Erro ao deletar foto' });
  }
});

export default router;
