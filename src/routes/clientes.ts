// backend/routes/clientes.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ClienteController } from '../controllers/cliente.controller';
import { authenticateToken } from '../infrastructure/middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();
const controller = new ClienteController();

// Configuração do multer para upload de logos
const logoStorage = multer.diskStorage({
  destination: path.resolve(__dirname, '../../uploads/logos'),
  filename: (_req, file, callback) => {
    const hash = crypto.randomBytes(6).toString('hex');
    const fileName = `logo-${hash}-${file.originalname}`;
    callback(null, fileName);
  }
});

const logoUpload = multer({
  storage: logoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (_req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Tipo de arquivo inválido. Apenas JPG, PNG e GIF são permitidos.'));
    }
  }
});

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// ✅ NOVA ROTA PARA LISTAR CLIENTES COM ID E NOME
router.get('/resumo', (req, res) => controller.list(req, res));

// Listar todos os clientes com seus contratos
router.get('/', (req, res) => controller.list(req, res));

// Buscar cliente por ID
router.get('/:id', (req, res) => controller.getById(req, res));

// Criar novo cliente
router.post('/', (req, res) => controller.create(req, res));

// Atualizar cliente existente
router.put('/:id', (req, res) => controller.update(req, res));

// Excluir cliente
router.delete('/:id', (req, res) => controller.delete(req, res));

// Upload de logo
router.post('/upload-logo', logoUpload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
    }

    const filename = req.file.filename;
    const logoPath = `/uploads/logos/${filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${logoPath}`;

    res.json({ 
      logoPath: fullUrl,
      filename: filename 
    });
  } catch (error: unknown) {
    console.error('Erro ao fazer upload do logo:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do logo.' });
  }
});

export default router;
