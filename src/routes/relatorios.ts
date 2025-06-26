import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../lib/prisma';
import { authenticateToken, requirePermission } from '../infrastructure/middleware/auth.middleware';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/relatorios'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post('/upload', requirePermission('create:relatorio'), upload.single('arquivo'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado' });
      return;
    }

    const { filename } = req.file;
    const { ocorrenciaId, cliente, tipo, dataAcionamento } = req.body;

    const relatorio = await prisma.relatorio.create({
      data: {
        nome: filename,
        data: new Date(),
        conteudo: JSON.stringify({
          ocorrenciaId: parseInt(ocorrenciaId),
          cliente,
          dataAcionamento: new Date(dataAcionamento)
        }),
        tipo
      }
    });

    res.status(201).json(relatorio);
  } catch (error) {
    console.error('Erro ao fazer upload do relatório:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do relatório' });
  }
});

router.get('/', requirePermission('read:relatorio'), async (_req: Request, res: Response): Promise<void> => {
  try {
    const relatorios = await prisma.relatorio.findMany({
      orderBy: {
        data: 'desc'
      }
    });

    res.json(relatorios);
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    res.status(500).json({ error: 'Erro ao listar relatórios' });
  }
});

router.get('/:id', requirePermission('read:relatorio'), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const relatorio = await prisma.relatorio.findUnique({
      where: { id }
    });

    if (!relatorio) {
      res.status(404).json({ error: 'Relatório não encontrado' });
      return;
    }

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    res.status(500).json({ error: 'Erro ao buscar relatório' });
  }
});

router.delete('/:id', requirePermission('delete:relatorio'), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    await prisma.relatorio.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar relatório:', error);
    res.status(500).json({ error: 'Erro ao deletar relatório' });
  }
});

export default router;
