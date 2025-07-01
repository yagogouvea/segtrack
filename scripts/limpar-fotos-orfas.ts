import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

const UPLOAD_DIR = path.resolve(__dirname, '../uploads');

async function limparFotosOrfas() {
  try {
    console.log('🔍 Verificando fotos órfãs...\n');

    // Buscar todas as fotos do banco
    const fotos = await prisma.foto.findMany({
      orderBy: { id: 'asc' }
    });

    console.log(`Total de fotos no banco: ${fotos.length}`);

    const fotosOrfas: any[] = [];
    const fotosValidas: any[] = [];

    for (const foto of fotos) {
      const filename = path.basename(foto.url);
      const filepath = path.join(UPLOAD_DIR, filename);
      const arquivoExiste = fs.existsSync(filepath);

      if (!arquivoExiste) {
        fotosOrfas.push(foto);
        console.log(`❌ Foto órfã encontrada: ID ${foto.id} - ${filename}`);
      } else {
        fotosValidas.push(foto);
      }
    }

    console.log(`\n📊 Resumo:`);
    console.log(`- Fotos válidas: ${fotosValidas.length}`);
    console.log(`- Fotos órfãs: ${fotosOrfas.length}`);

    if (fotosOrfas.length > 0) {
      console.log(`\n🗑️ Removendo ${fotosOrfas.length} fotos órfãs...`);
      
      for (const foto of fotosOrfas) {
        await prisma.foto.delete({
          where: { id: foto.id }
        });
        console.log(`✅ Removida foto ID ${foto.id}`);
      }

      console.log(`\n✅ Limpeza concluída! ${fotosOrfas.length} fotos órfãs removidas.`);
    } else {
      console.log(`\n✅ Nenhuma foto órfã encontrada!`);
    }

  } catch (error) {
    console.error('❌ Erro ao limpar fotos órfãs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
limparFotosOrfas(); 