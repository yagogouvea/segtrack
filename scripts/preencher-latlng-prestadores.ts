import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function geocodeEndereco(endereco: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`;
  const { data } = await axios.get(url, { headers: { 'User-Agent': 'segtrack-mapa-script' } });
  if (Array.isArray(data) && data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

async function main() {
  const prestadores = await prisma.prestador.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null }
      ]
    }
  });

  console.log(`Encontrados ${prestadores.length} prestadores sem lat/lng.`);

  for (const p of prestadores) {
    const endereco = [p.endereco, p.bairro, p.cidade, p.estado, 'Brasil'].filter(Boolean).join(', ');
    console.log(`Geocodificando: ${p.nome} - ${endereco}`);
    try {
      const coords = await geocodeEndereco(endereco);
      if (coords) {
        await prisma.prestador.update({
          where: { id: p.id },
          data: { latitude: coords.lat, longitude: coords.lng }
        });
        console.log(`✔️ Atualizado: ${p.nome} (${coords.lat}, ${coords.lng})`);
      } else {
        console.warn(`❌ Não encontrado: ${p.nome}`);
      }
    } catch (e: any) {
      console.error(`Erro ao geocodificar ${p.nome}:`, e.message);
    }
    await new Promise(res => setTimeout(res, 1200)); // Evita rate limit
  }
  await prisma.$disconnect();
  console.log('Finalizado!');
}

main(); 