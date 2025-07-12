import { Router } from 'express';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';
import { PrestadorController } from '../../../controllers/prestador.controller';
import { ensurePrisma } from '../../../lib/prisma';

const router = Router();
const controller = new PrestadorController();

// Rotas públicas
router.get('/public', controller.listPublic);

// 🔹 ROTA - Listar prestadores para popup de seleção (nome e codinome)
router.get('/popup', async (_req, res) => {
  try {
    const db = await ensurePrisma();
    const prestadores = await db.prestador.findMany({
      select: {
        id: true,
        nome: true,
        cod_nome: true
      },
      orderBy: { nome: 'asc' }
    });
    res.json(prestadores);
  } catch (err) {
    console.error('❌ Erro ao buscar prestadores para popup:', err);
    res.status(500).json({ erro: 'Erro ao buscar prestadores' });
  }
});

// ✅ ROTA - Buscar prestador por nome (usado no popup de passagem de serviço)
router.get('/buscar-por-nome/:nome', async (req, res) => {
  const { nome } = req.params;

  try {
    const db = await ensurePrisma();
    const prestador = await db.prestador.findFirst({
      where: {
        nome: {
          contains: nome
        }
      },
      select: {
        nome: true,
        telefone: true
      }
    });

    if (!prestador) {
      return res.status(404).json({ erro: 'Prestador não encontrado' });
    }

    return res.json(prestador);
  } catch (err) {
    console.error('❌ Erro ao buscar prestador por nome:', err);
    return res.status(500).json({ erro: 'Erro ao buscar prestador' });
  }
});

// ✅ ROTA - Buscar prestadores por termo de busca (usado no autocomplete)
router.get('/buscar', async (req, res) => {
  const { q } = req.query;

  try {
    const db = await ensurePrisma();
    const prestadores = await db.prestador.findMany({
      where: {
        nome: {
          contains: String(q || ''),
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        nome: true,
        cod_nome: true
      },
      orderBy: { nome: 'asc' },
      take: 10
    });

    return res.json(prestadores);
  } catch (err) {
    console.error('❌ Erro ao buscar prestadores:', err);
    return res.status(500).json({ erro: 'Erro ao buscar prestadores' });
  }
});

// Rotas protegidas
router.use(authenticateToken);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router; 