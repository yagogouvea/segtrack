import express, { Router, Request, Response } from 'express';
import axios from 'axios';
import { ensurePrisma } from '@/lib/prisma';

interface ApiBrasilResponse {
  response: {
    modelo?: string;
    cor_veiculo?: {
      cor?: string;
    };
    cor?: string;
    marca?: string;
  };
}

const router: Router = express.Router();

router.get('/:placa', async (req: Request, res: Response) => {
  const { placa } = req.params;

  const placaFormatada = placa.toUpperCase();
  const placaValida = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

  if (!placaValida.test(placaFormatada)) {
    return res.status(400).json({ erro: 'Placa inválida. Use formato AAA1234 ou AAA1B23' });
  }

  if (!process.env.API_BRASIL_DEVICE || !process.env.API_BRASIL_BEARER) {
    return res.status(500).json({ erro: 'Tokens da API Brasil não configurados' });
  }

  try {
    let veiculo = await ensurePrisma().veiculo.findFirst({
      where: { placa: placaFormatada },
    });

    if (!veiculo) {
      const response = await axios.post<ApiBrasilResponse>(
        'https://gateway.apibrasil.io/api/v2/vehicles/dados',
        { placa: placaFormatada },
        {
          headers: {
            'Content-Type': 'application/json',
            'DeviceToken': process.env.API_BRASIL_DEVICE,
            'Authorization': `Bearer ${process.env.API_BRASIL_BEARER}`
          }
        }
      );

      const dados = response.data?.response;
      console.log('🔎 Dados recebidos da API Brasil:', dados);

      if (!dados?.modelo) {
        return res.status(404).json({ erro: 'Veículo não encontrado' });
      }

      veiculo = await ensurePrisma().veiculo.create({
        data: {
          placa: placaFormatada,
          modelo: dados.modelo || '',
          cor: dados.cor_veiculo?.cor || dados.cor || '',
          fabricante: dados.marca || ''
        }
      });
    }

    return res.json(veiculo);
  } catch (err) {
    console.error('❌ Erro ao buscar veículo:', err);
    return res.status(500).json({ erro: 'Erro ao buscar veículo' });
  }
});

router.get('/', async (req, res) => {
  try {
    const db = ensurePrisma();
    const veiculos = await db.veiculo.findMany();
    res.json(veiculos);
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ error: 'Erro ao listar veículos' });
  }
});

export default router;
