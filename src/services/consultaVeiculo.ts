// backend/src/services/consultaVeiculo.ts
import axios from 'axios';

const API_URL = 'https://gateway.apibrasil.io/api/v2/vehicles/dados';

export async function buscarVeiculoPorPlaca(placa: string) {
  const placaFormatada = placa.toUpperCase();
  const placaValida = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
  if (!placaValida.test(placaFormatada)) return null;

  if (!process.env.API_BRASIL_DEVICE || !process.env.API_BRASIL_BEARER) {
    throw new Error('⚠️ Tokens da API Brasil não configurados corretamente.');
  }

  try {
    const response = await axios.post(
      API_URL,
      { placa: placaFormatada },
      {
        headers: {
          'Content-Type': 'application/json',
          'DeviceToken': process.env.API_BRASIL_DEVICE,
          'Authorization': `Bearer ${process.env.API_BRASIL_BEARER}`
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error('❌ Erro ao consultar API Brasil:', error);
    return null;
  }
}
