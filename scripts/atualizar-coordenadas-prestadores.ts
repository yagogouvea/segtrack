import { PrismaClient } from '@prisma/client';

// Função para garantir que o prisma está disponível
async function ensurePrisma(): Promise<PrismaClient> {
  if (!process.env.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL não está definida no arquivo .env');
  }

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'minimal',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    // Testa a conexão
    await prisma.$queryRaw`SELECT 1`;
    console.log('[Prisma] Conexão com o banco de dados está ativa');
    return prisma;
  } catch (error) {
    console.error('[Prisma] Erro ao verificar conexão:', error);
    throw new Error('Erro de conexão com o banco de dados');
  }
}

// Função para obter coordenadas via geocodificação
async function getCoordinates(endereco: string, cidade: string, estado: string): Promise<{ latitude: number | null, longitude: number | null }> {
  try {
    // Validar se temos os dados mínimos necessários
    if (!endereco || !cidade || !estado) {
      console.log('⚠️ Dados de endereço incompletos:', { endereco, cidade, estado });
      return { latitude: null, longitude: null };
    }

    const enderecoCompleto = `${endereco}, ${cidade}, ${estado}, Brasil`;
    console.log('🔍 Geocodificando endereço:', enderecoCompleto);
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1`;
    
    const response = await fetch(url);
    const data = await response.json() as any[];
    
    if (data && data.length > 0) {
      const result = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
      console.log('✅ Coordenadas encontradas:', result);
      return result;
    }
    
    console.log('⚠️ Nenhuma coordenada encontrada para:', enderecoCompleto);
    return { latitude: null, longitude: null };
  } catch (error) {
    console.error('❌ Erro ao geocodificar endereço:', error);
    return { latitude: null, longitude: null };
  }
}

async function atualizarCoordenadasPrestadores() {
  try {
    console.log('🔄 Iniciando atualização de coordenadas de prestadores...\n');
    
    const db = await ensurePrisma();
    
    // Buscar todos os prestadores que têm endereço mas podem não ter coordenadas
    const prestadores = await db.prestador.findMany({
      where: {
        AND: [
          { endereco: { not: null } },
          { cidade: { not: null } },
          { estado: { not: null } }
        ]
      },
      select: {
        id: true,
        nome: true,
        endereco: true,
        cidade: true,
        estado: true,
        latitude: true,
        longitude: true
      }
    });

    console.log(`📊 Encontrados ${prestadores.length} prestadores com endereço completo\n`);

    let atualizados = 0;
    let comErro = 0;

    for (const prestador of prestadores) {
      console.log(`\n🔍 Processando: ${prestador.nome} (ID: ${prestador.id})`);
      console.log(`📍 Endereço atual: ${prestador.endereco}, ${prestador.cidade}, ${prestador.estado}`);
      console.log(`📍 Coordenadas atuais: ${prestador.latitude}, ${prestador.longitude}`);

      // Obter novas coordenadas
      const coordinates = await getCoordinates(
        prestador.endereco!,
        prestador.cidade!,
        prestador.estado!
      );

      if (coordinates.latitude && coordinates.longitude) {
        // Atualizar coordenadas no banco
        await db.prestador.update({
          where: { id: prestador.id },
          data: {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          }
        });

        console.log(`✅ Coordenadas atualizadas para: ${coordinates.latitude}, ${coordinates.longitude}`);
        atualizados++;
      } else {
        console.log(`⚠️ Não foi possível obter coordenadas para este prestador`);
        comErro++;
      }

      // Aguardar um pouco entre as requisições para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n🎉 Atualização concluída!`);
    console.log(`✅ Prestadores atualizados: ${atualizados}`);
    console.log(`⚠️ Prestadores com erro: ${comErro}`);
    console.log(`📊 Total processado: ${prestadores.length}`);

  } catch (error) {
    console.error('❌ Erro durante a atualização:', error);
  }
}

// Executar o script
atualizarCoordenadasPrestadores()
  .then(() => {
    console.log('\n✅ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro no script:', error);
    process.exit(1);
  }); 