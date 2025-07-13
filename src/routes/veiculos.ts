import express, { Router, Request, Response } from 'express';
import { ensurePrisma } from '@/lib/prisma';
import { authenticateToken } from '@/infrastructure/middleware/auth.middleware';

const router: Router = express.Router();

// Add authentication middleware to all vehicle routes
router.use(authenticateToken);

router.get('/:placa', async (req: Request, res: Response) => {
  const { placa } = req.params;

  const placaFormatada = placa.toUpperCase();
  const placaValida = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

  if (!placaValida.test(placaFormatada)) {
    return res.status(400).json({ erro: 'Placa inválida. Use formato AAA1234 ou AAA1B23' });
  }

  try {
    let veiculo = await (await ensurePrisma()).veiculo.findFirst({
      where: { placa: placaFormatada },
    });

    if (!veiculo) {
      // Criar veículo básico se não existir
      veiculo = await (await ensurePrisma()).veiculo.create({
        data: {
          placa: placaFormatada,
          modelo: 'Não informado',
          cor: 'Não informado',
          fabricante: 'Não informado'
        }
      });
      console.log('✅ Veículo criado:', placaFormatada);
    }

    return res.json(veiculo);
  } catch (err) {
    console.error('❌ Erro ao buscar/criar veículo:', err);
    return res.status(500).json({ erro: 'Erro ao processar veículo' });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = await ensurePrisma();
    const veiculos = await db.veiculo.findMany();
    res.json(veiculos);
  } catch (error: unknown) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ error: 'Erro ao listar veículos' });
  }
});

export default router;
