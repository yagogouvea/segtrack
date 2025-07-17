import express, { Request, Response } from 'express';
import { ensurePrisma } from '../lib/prisma';
import { PrestadorController } from '../controllers/prestador.controller';

const router = express.Router();
const controller = new PrestadorController();

// GET - Listar todos os prestadores (completo)
// Query params suportados: nome, cod_nome, regioes (csv), funcoes (csv), page, pageSize
router.get('/', (req, res) => controller.list(req, res));

// GET - Listar prestadores resumido (para formulários)
router.get('/resumo', async (req: Request, res: Response) => {
  try {
    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
    }

    const prestadores = await db.prestador.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true
      },
      where: {
        aprovado: true // Apenas prestadores aprovados
      },
      orderBy: {
        nome: 'asc'
      }
    });

    res.json(prestadores);
  } catch (error) {
    console.error('Erro ao buscar prestadores resumo:', error);
    res.status(500).json({ error: 'Erro ao buscar prestadores' });
  }
});

// GET - Buscar prestador por ID
router.get('/:id', (req, res) => controller.getById(req, res));

// POST - Criar novo prestador
router.post('/', (req, res) => controller.create(req, res));

// PUT - Atualizar prestador
router.put('/:id', (req, res) => controller.update(req, res));

// DELETE - Deletar prestador
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
