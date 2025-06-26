// backend/routes/clientes.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ClienteController } from '../controllers/cliente.controller';
import { authenticateToken, requirePermission } from '../infrastructure/middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();
const controller = new ClienteController();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Configuração do multer para upload de logos
const LOGOS_DIR = path.resolve(__dirname, '../../uploads/logos');

// Garantir que a pasta uploads/logos existe
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, LOGOS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, `logo-${uniqueSuffix}${ext}`);
  }
});

const uploadLogo = multer({
  storage: logoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Apenas JPG, PNG, GIF e WEBP são permitidos.'));
    }
  }
});

// Rota para upload de logo
router.post('/upload-logo', requirePermission('update:cliente'), uploadLogo.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const logoPath = `uploads/logos/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      logoPath,
      message: 'Logo enviado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do logo' });
  }
});

// ✅ NOVA ROTA PARA LISTAR CLIENTES COM ID E NOME
router.get('/resumo', requirePermission('read:cliente'), (req, res) => controller.list(req, res));

// Listar todos os clientes com seus contratos
router.get('/', requirePermission('read:cliente'), (req, res) => controller.list(req, res));

// Buscar cliente por ID
router.get('/:id', requirePermission('read:cliente'), (req, res) => controller.getById(req, res));

// Criar novo cliente
router.post('/', requirePermission('create:cliente'), (req, res) => controller.create(req, res));

// Atualizar cliente existente
router.put('/:id', requirePermission('update:cliente'), (req, res) => controller.update(req, res));

// Excluir cliente
router.delete('/:id', requirePermission('delete:cliente'), (req, res) => controller.delete(req, res));

export default router;
