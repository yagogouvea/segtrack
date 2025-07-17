import { Router } from 'express';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';
import { OcorrenciaController } from '../controllers/ocorrencia.controller';
import multer from 'multer';
import { uploadConfig } from '../../../config/upload.config';
import { validateOcorrencia } from '../validators/ocorrencia.validator';
import { ensurePrisma } from '../../../lib/prisma';

const router = Router();
const controller = new OcorrenciaController();
const upload = multer(uploadConfig);

// Temporarily comment out auth for debugging
// router.use(authenticateToken);

// Listagem e busca
router.get('/', controller.list);
router.get('/:id', controller.findById);

// Buscar ocorrências por prestador
router.get('/prestador/:prestadorId', authenticateToken, async (req, res) => {
  try {
    const { prestadorId } = req.params;
    console.log(`[ocorrencias.routes] Buscando ocorrências para prestador: ${prestadorId}`);
    console.log(`[ocorrencias.routes] Usuário autenticado:`, req.user);
    
    const db = await ensurePrisma();
    
    if (!db) {
      console.error('[ocorrencias.routes] Erro: Instância do Prisma não disponível');
      return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
    }

    // Buscar prestador primeiro para validar
    const prestador = await db.prestador.findFirst({
      where: { 
        OR: [
          { id: Number(prestadorId) },
          { nome: prestadorId }
        ]
      }
    });

    if (!prestador) {
      console.log(`[ocorrencias.routes] Prestador não encontrado: ${prestadorId}`);
      return res.status(404).json({ error: 'Prestador não encontrado' });
    }

    console.log(`[ocorrencias.routes] Prestador encontrado: ${prestador.nome} (ID: ${prestador.id})`);

    // Buscar ocorrências vinculadas ao prestador
    const ocorrencias = await db.ocorrencia.findMany({
      where: {
        prestador: prestador.nome,
        status: {
          in: ['em_andamento', 'aguardando']
        }
      },
      include: {
        fotos: true
      },
      orderBy: {
        criado_em: 'desc'
      }
    });

    console.log(`[ocorrencias.routes] Ocorrências encontradas: ${ocorrencias.length}`);

    res.json({
      prestador: {
        id: prestador.id,
        nome: prestador.nome,
        email: prestador.email
      },
      ocorrencias: ocorrencias,
      total: ocorrencias.length
    });
  } catch (error) {
    console.error('[ocorrencias.routes] Erro ao buscar ocorrências do prestador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criação e atualização
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Upload de fotos
router.post('/:id/fotos', upload.array('fotos'), controller.addFotos);

// Rotas específicas
router.get('/status/:status', controller.findByStatus);
router.get('/placa/:placa', controller.findByPlaca);

export default router; 