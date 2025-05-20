// ✅ src/services/veiculos.ts
import axios from 'axios';

const API_URL = 'https://gateway.apibrasil.io/api/v2/vehicles/dados';

export async function buscarVeiculoPorPlaca(placa: string) {
  try {
    const response = await axios.post(
      API_URL,
      { placa: placa.toUpperCase() },
      {
        headers: {
          'Content-Type': 'application/json',
          'DeviceToken': process.env.API_BRASIL_DEVICE || '',
          'Authorization': `Bearer ${process.env.API_BRASIL_BEARER}`
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao consultar API Brasil:', error);
    return null;
  }
}
