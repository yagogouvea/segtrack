import express, { Router, Request, Response } from 'express';
import axios from 'axios';
import prisma from '../lib/prisma';

const router: Router = express.Router();

router.get('/:placa', (req: Request, res: Response): void => {
  (async () => {
    const { placa } = req.params;

    // Validação de formato da placa (padrão AAA1234 ou AAA1B23)
    const placaValida = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i;
    if (!placaValida.test(placa.toUpperCase())) {
      return res.status(400).json({ erro: 'Placa inválida. Use formato AAA1234 ou AAA1B23' });
    }

    try {
      let veiculo = await prisma.veiculo.findFirst({
        where: { placa: placa.toUpperCase() },
      });

      if (!veiculo) {
        const response = await axios.post(
          'https://gateway.apibrasil.io/api/v2/vehicles/dados',
          { placa: placa.toUpperCase() },
          {
            headers: {
              'Content-Type': 'application/json',
              'DeviceToken': process.env.API_BRASIL_DEVICE || '',
              'Authorization': `Bearer ${process.env.API_BRASIL_BEARER || ''}`
            }
          }
        );

        const dados = response.data;
        console.log('🔎 Dados recebidos da API Brasil:', dados);

        const info = dados.response;

        if (!info?.modelo) {
          return res.status(404).json({ erro: 'Veículo não encontrado' });
        }

        veiculo = await prisma.veiculo.create({
          data: {
            placa: placa.toUpperCase(),
            modelo: info.modelo || '',
            cor: info.cor_veiculo?.cor || info.cor || '',
            fabricante: info.marca || ''
          }
        });
      }

      res.json(veiculo);
    } catch (error: any) {
      console.error('❌ Erro ao buscar veículo:', error.message);
      if (error.response) {
        console.error('➡️ Erro da API Brasil:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      res.status(500).json({ erro: 'Erro ao buscar dados do veículo' });
    }
  })();
});

export default router;