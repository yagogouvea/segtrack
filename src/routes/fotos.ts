import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/db';


const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// 🔹 Upload de novas fotos
router.post('/', upload.array('imagens'), async (req: Request, res: Response) => {
  const { ocorrenciaId } = req.body;
  const arquivos = req.files as Express.Multer.File[];
  const legendas = Array.isArray(req.body.legendas) ? req.body.legendas : [req.body.legendas];

  if (!ocorrenciaId) {
    return res.status(400).json({ error: 'ocorrenciaId é obrigatório.' });
  }

  try {
    const fotosCriadas = await Promise.all(
      arquivos.map((file, i) => {
        const extensao = path.extname(file.originalname) || '.jpg';
        const nomeArquivo = `${Date.now()}-${Math.random().toString(36).substring(2)}${extensao}`;
        const destino = path.join('uploads', nomeArquivo);
        fs.renameSync(file.path, destino);
        const url = `/uploads/${nomeArquivo}`;
        return prisma.foto.create({
          data: {
            url,
            legenda: legendas[i] || '',
            ocorrenciaId: Number(ocorrenciaId)
          }
        });
      })
    );

    res.status(201).json(fotosCriadas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar fotos.', detalhes: String(error) });
  }
});

// 🔹 Atualizar legenda da foto
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { legenda } = req.body;

  try {
    const fotoAtualizada = await prisma.foto.update({
      where: { id: Number(id) },
      data: { legenda }
    });

    res.json(fotoAtualizada);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar legenda da foto.', detalhes: String(error) });
  }
});

// 🔹 Remover foto
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const foto = await prisma.foto.findUnique({ where: { id: Number(id) } });

    if (!foto) {
      return res.status(404).json({ error: 'Foto não encontrada.' });
    }

    if (foto.url) {
      const caminho = path.join('uploads', path.basename(foto.url));
      if (fs.existsSync(caminho)) {
        fs.unlinkSync(caminho);
      }
    }

    await prisma.foto.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar foto.', detalhes: String(error) });
  }
});

// 🔹 Listar fotos por ocorrência
router.get('/por-ocorrencia/:ocorrenciaId', async (req: Request, res: Response) => {
  const { ocorrenciaId } = req.params;

  try {
    const fotos = await prisma.foto.findMany({
      where: { ocorrenciaId: Number(ocorrenciaId) },
      orderBy: { id: 'asc' }
    });

    res.json(fotos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar fotos.', detalhes: String(error) });
  }
});

export default router;
