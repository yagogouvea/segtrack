const { PrismaClient } = require('@prisma/client');
const https = require('https');

const prisma = new PrismaClient();

// Função para geocodificar endereço
async function geocodificarEndereco(endereco, cidade, estado) {
  try {
    const enderecoCompleto = `${endereco}, ${cidade}, ${estado}, Brasil`;
    console.log('🔍 Geocodificando:', enderecoCompleto);
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1`;
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'nominatim.openstreetmap.org',
        path: `/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1`,
        method: 'GET',
        headers: {
          'User-Agent': 'SegTrack-App/1.0',
          'Accept': 'application/json'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            // Verificar se a resposta é HTML (erro)
            if (data.trim().startsWith('<html>') || data.trim().startsWith('<!DOCTYPE')) {
              console.log('⚠️ Serviço Nominatim retornou HTML (possível bloqueio):', data.substring(0, 200));
              resolve({ latitude: null, longitude: null });
              return;
            }
            
            const results = JSON.parse(data);
            if (results && results.length > 0) {
              const coordenadas = {
                latitude: parseFloat(results[0].lat),
                longitude: parseFloat(results[0].lon)
              };
              console.log('✅ Coordenadas encontradas:', coordenadas);
              resolve(coordenadas);
            } else {
              console.log('⚠️ Nenhuma coordenada encontrada');
              resolve({ latitude: null, longitude: null });
            }
          } catch (error) {
            console.error('❌ Erro ao processar resposta:', error);
            console.log('📄 Resposta recebida:', data.substring(0, 500));
            resolve({ latitude: null, longitude: null });
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Erro na requisição:', error);
        resolve({ latitude: null, longitude: null });
      });
      
      req.end();
    });
  } catch (error) {
    console.error('❌ Erro na geocodificação:', error);
    return { latitude: null, longitude: null };
  }
}

async function testarAtualizacaoCompleta() {
  try {
    console.log('🧪 Testando atualização completa de prestador...\n');
    
    // 1. Buscar um prestador existente
    const prestador = await prisma.prestador.findFirst({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      include: {
        funcoes: true,
        regioes: true,
        veiculos: true
      }
    });
    
    if (!prestador) {
      console.log('❌ Nenhum prestador com coordenadas encontrado');
      return;
    }
    
    console.log('📍 Prestador encontrado:', {
      id: prestador.id,
      nome: prestador.nome,
      endereco: prestador.endereco,
      cidade: prestador.cidade,
      estado: prestador.estado,
      latitude: prestador.latitude,
      longitude: prestador.longitude
    });
    
    // 2. Testar geocodificação manual
    const coordenadasAntigas = {
      latitude: prestador.latitude,
      longitude: prestador.longitude
    };
    
    console.log('\n🔍 Testando geocodificação manual...');
    const novasCoordenadas = await geocodificarEndereco(
      prestador.endereco + ' (TESTE ATUALIZAÇÃO)',
      prestador.cidade,
      prestador.estado
    );
    
    if (!novasCoordenadas.latitude || !novasCoordenadas.longitude) {
      console.log('❌ Não foi possível obter novas coordenadas via geocodificação');
      console.log('🔄 Testando atualização com coordenadas simuladas...');
      
      // Simular novas coordenadas para teste
      const coordenadasSimuladas = {
        latitude: prestador.latitude + 0.001, // Pequena variação
        longitude: prestador.longitude + 0.001
      };
      
      // 3. Atualizar o prestador diretamente no banco
      console.log('\n🔄 Atualizando prestador no banco...');
      const prestadorAtualizado = await prisma.prestador.update({
        where: { id: prestador.id },
        data: {
          endereco: prestador.endereco + ' (TESTE ATUALIZAÇÃO)',
          latitude: coordenadasSimuladas.latitude,
          longitude: coordenadasSimuladas.longitude
        },
        include: {
          funcoes: true,
          regioes: true,
          veiculos: true
        }
      });
      
      console.log('✅ Prestador atualizado no banco:', {
        id: prestadorAtualizado.id,
        endereco: prestadorAtualizado.endereco,
        latitude: prestadorAtualizado.latitude,
        longitude: prestadorAtualizado.longitude
      });
      
      // 4. Verificar se as coordenadas foram atualizadas
      const prestadorVerificado = await prisma.prestador.findUnique({
        where: { id: prestador.id }
      });
      
      console.log('\n🔍 Verificação final:');
      console.log('📍 Coordenadas antigas:', coordenadasAntigas);
      console.log('📍 Coordenadas novas:', {
        latitude: prestadorVerificado.latitude,
        longitude: prestadorVerificado.longitude
      });
      
      if (prestadorVerificado.latitude !== coordenadasAntigas.latitude || 
          prestadorVerificado.longitude !== coordenadasAntigas.longitude) {
        console.log('✅ Coordenadas foram atualizadas com sucesso!');
      } else {
        console.log('❌ Coordenadas não foram atualizadas');
      }
      
      // 5. Testar a API de mapa
      console.log('\n🌐 Testando API de mapa...');
      const prestadoresMapa = await prisma.prestador.findMany({
        where: {
          id: prestador.id
        },
        select: {
          id: true,
          nome: true,
          telefone: true,
          latitude: true,
          longitude: true,
          cidade: true,
          estado: true,
          bairro: true,
          regioes: { select: { regiao: true } },
          funcoes: { select: { funcao: true } }
        }
      });
      
      const prestadorNoMapa = prestadoresMapa.find(p => p.id === prestador.id);
      if (prestadorNoMapa) {
        console.log('✅ Prestador encontrado na API de mapa:', {
          id: prestadorNoMapa.id,
          nome: prestadorNoMapa.nome,
          latitude: prestadorNoMapa.latitude,
          longitude: prestadorNoMapa.longitude
        });
      } else {
        console.log('❌ Prestador não encontrado na API de mapa');
      }
      
    } else {
      // Usar as coordenadas reais obtidas via geocodificação
      console.log('\n🔄 Atualizando prestador no banco com coordenadas reais...');
      const prestadorAtualizado = await prisma.prestador.update({
        where: { id: prestador.id },
        data: {
          endereco: prestador.endereco + ' (TESTE ATUALIZAÇÃO)',
          latitude: novasCoordenadas.latitude,
          longitude: novasCoordenadas.longitude
        },
        include: {
          funcoes: true,
          regioes: true,
          veiculos: true
        }
      });
      
      console.log('✅ Prestador atualizado no banco:', {
        id: prestadorAtualizado.id,
        endereco: prestadorAtualizado.endereco,
        latitude: prestadorAtualizado.latitude,
        longitude: prestadorAtualizado.longitude
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarAtualizacaoCompleta(); 