import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requirePermission } from '../infrastructure/middleware/auth.middleware';

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

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// 🔹 Upload de novas fotos
router.post('/', requirePermission('create:foto'), upload.single('foto'), async (req: Request, res: Response): Promise<void> => {
  const { ocorrenciaId, legenda } = req.body;
  const arquivo = req.file;

  if (!arquivo) {
    res.status(400).json({ error: 'Arquivo de foto é obrigatório.' });
    return;
  }
  if (!ocorrenciaId) {
    res.status(400).json({ error: 'ocorrenciaId é obrigatório.' });
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

    const nomeArquivo = arquivo.filename;
    const url = nomeArquivo.startsWith('uploads/') ? `/${nomeArquivo}` : `/uploads/${nomeArquivo}`;

    const fotoCriada = await prisma.foto.create({
      data: {
        url,
        legenda: legenda || '',
        ocorrenciaId: Number(ocorrenciaId)
      }
    });

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

// 🔹 Atualizar legenda da foto
router.put('/:id', requirePermission('update:foto'), async (req: Request, res: Response): Promise<void> => {
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
router.delete('/:id', requirePermission('delete:foto'), async (req: Request, res: Response): Promise<void> => {
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
router.get('/por-ocorrencia/:ocorrenciaId', requirePermission('read:foto'), async (req: Request, res: Response): Promise<void> => {
  console.log('Buscando fotos para ocorrência ID:', req.params.ocorrenciaId);
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

// Rota de teste para upload (sem autenticação)
router.post('/test', upload.single('foto'), async (req: Request, res: Response): Promise<void> => {
  console.log('=== TESTE UPLOAD ===');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  console.log('req.headers:', req.headers);
  console.log('===================');

  if (!req.file) {
    res.status(400).json({ 
      error: 'Nenhum arquivo enviado',
      message: 'Certifique-se de enviar um arquivo de imagem válido'
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Upload de teste realizado com sucesso',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
});

// Rota de teste com autenticação simulada
router.post('/test-auth', upload.single('foto'), async (req: Request, res: Response): Promise<void> => {
  console.log('=== TESTE UPLOAD COM AUTH ===');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  console.log('Authorization:', req.headers.authorization);
  console.log('============================');

  if (!req.file) {
    res.status(400).json({ 
      error: 'Nenhum arquivo enviado',
      message: 'Certifique-se de enviar um arquivo de imagem válido'
    });
    return;
  }

  // Simular verificação de token
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ 
      error: 'Token não fornecido',
      message: 'Header Authorization é obrigatório'
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Upload autenticado realizado com sucesso',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    },
    auth: 'Token fornecido'
  });
});

export default router;
