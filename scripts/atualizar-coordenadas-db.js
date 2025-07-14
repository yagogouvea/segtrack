const { PrismaClient } = require('@prisma/client');

// Função para normalizar e limpar endereços
function normalizarEndereco(endereco, cidade, estado, bairro) {
  // Limpar endereço
  let enderecoLimpo = endereco
    .replace(/\([^)]*\)/g, '') // Remove parênteses e conteúdo
    .replace(/TESTE.*$/i, '') // Remove "TESTE" e tudo depois
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim();

  // Normalizar cidade e estado
  const cidadeNormalizada = cidade.trim();
  const estadoNormalizado = estado.trim();

  // Criar variações do endereço
  const variacoes = [];

  // Variação 1: Endereço completo com bairro
  if (bairro && bairro.trim()) {
    variacoes.push(`${enderecoLimpo}, ${bairro.trim()}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`);
  }

  // Variação 2: Endereço sem bairro
  variacoes.push(`${enderecoLimpo}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`);

  // Variação 3: Apenas cidade e estado (fallback)
  variacoes.push(`${cidadeNormalizada}, ${estadoNormalizado}, Brasil`);

  // Variação 4: Endereço simplificado (remove números e detalhes)
  const enderecoSimplificado = enderecoLimpo
    .replace(/\d+/g, '') // Remove números
    .replace(/[A-Za-z]+(?:\s+[A-Za-z]+)*/, (match) => match.trim()) // Pega apenas palavras
    .trim();
  
  if (enderecoSimplificado && enderecoSimplificado !== enderecoLimpo) {
    variacoes.push(`${enderecoSimplificado}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`);
  }

  return variacoes;
}

// Função para obter coordenadas via geocodificação
async function getCoordinates(endereco, cidade, estado, bairro) {
  try {
    // Validar se temos os dados mínimos necessários
    if (!endereco || !cidade || !estado) {
      console.log('⚠️ Dados de endereço incompletos:', { endereco, cidade, estado });
      return { latitude: null, longitude: null };
    }

    // Normalizar e criar variações do endereço
    const variacoes = normalizarEndereco(endereco, cidade, estado, bairro);
    
    console.log('🔍 Tentando geocodificar com variações:', variacoes);

    // Tentar cada variação até encontrar coordenadas
    for (let i = 0; i < variacoes.length; i++) {
      const enderecoCompleto = variacoes[i];
      console.log(`📍 Tentativa ${i + 1}: ${enderecoCompleto}`);
      
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
        console.log(`✅ Coordenadas encontradas na tentativa ${i + 1}:`, result);
        return result;
      }
      
      // Aguardar um pouco entre tentativas para não sobrecarregar a API
      if (i < variacoes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('⚠️ Nenhuma coordenada encontrada para nenhuma variação do endereço');
    return { latitude: null, longitude: null };
  } catch (error) {
    console.error('❌ Erro ao geocodificar endereço:', error);
    return { latitude: null, longitude: null };
  }
}

async function atualizarCoordenadasPrestadores() {
  try {
    console.log('🔄 Iniciando atualização de coordenadas de prestadores...\n');
    
    // Conectar ao banco de dados
    const prisma = new PrismaClient();
    
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados!');
    
    // Buscar todos os prestadores que têm endereço mas podem não ter coordenadas
    const prestadores = await prisma.prestador.findMany({
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
        bairro: true,
        latitude: true,
        longitude: true
      }
    });

    console.log(`📊 Encontrados ${prestadores.length} prestadores com endereço completo\n`);

    // Filtrar prestadores que precisam de atualização
    const prestadoresParaAtualizar = prestadores.filter(prestador => {
      const temCoordenadas = prestador.latitude && prestador.longitude && 
                             prestador.latitude !== 0 && prestador.longitude !== 0;
      return !temCoordenadas;
    });

    console.log(`🔍 ${prestadoresParaAtualizar.length} prestadores precisam de atualização de coordenadas\n`);

    if (prestadoresParaAtualizar.length === 0) {
      console.log('✅ Todos os prestadores já têm coordenadas válidas!');
      return;
    }

    let atualizados = 0;
    let comErro = 0;

    // Atualizar coordenadas
    for (const prestador of prestadoresParaAtualizar) {
      console.log(`\n🔍 Processando: ${prestador.nome} (ID: ${prestador.id})`);
      console.log(`📍 Endereço: ${prestador.endereco}, ${prestador.cidade}, ${prestador.estado}`);

      // Obter novas coordenadas
      const coordinates = await getCoordinates(
        prestador.endereco,
        prestador.cidade,
        prestador.estado,
        prestador.bairro
      );

      if (coordinates.latitude && coordinates.longitude) {
        try {
          // Atualizar no banco de dados
          await prisma.prestador.update({
            where: { id: prestador.id },
            data: {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude
            }
          });

          console.log(`✅ Coordenadas atualizadas para: ${coordinates.latitude}, ${coordinates.longitude}`);
          atualizados++;
        } catch (error) {
          console.log(`❌ Erro ao atualizar prestador: ${error.message}`);
          comErro++;
        }
      } else {
        console.log(`⚠️ Não foi possível obter coordenadas para este prestador`);
        comErro++;
      }

      // Aguardar um pouco entre as requisições
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n🎉 Atualização concluída!`);
    console.log(`✅ Prestadores atualizados: ${atualizados}`);
    console.log(`⚠️ Prestadores com erro: ${comErro}`);
    console.log(`📊 Total processado: ${prestadoresParaAtualizar.length}`);

    // Desconectar do banco
    await prisma.$disconnect();

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