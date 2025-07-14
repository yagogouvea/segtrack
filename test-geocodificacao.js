// Script para testar a geocodificação
async function testGeocodificacao() {
  console.log('🧪 Testando geocodificação...');

  // Função de geocodificação (cópia da implementação)
  async function getCoordinates(endereco, cidade, estado, bairro) {
    try {
      console.log('🔍 [TEST] Iniciando geocodificação:', { endereco, cidade, estado, bairro });
      
      if (!endereco || !cidade || !estado) {
        console.log('⚠️ [TEST] Dados de endereço incompletos:', { endereco, cidade, estado });
        return { latitude: null, longitude: null };
      }

      // Normalizar endereço
      const enderecoLimpo = endereco
        .replace(/\([^)]*\)/g, '')
        .replace(/TESTE.*$/i, '')
        .replace(/\s+/g, ' ')
        .trim();

      const cidadeNormalizada = cidade.trim();
      const estadoNormalizado = estado.trim();
      const bairroNormalizado = bairro ? bairro.trim() : '';

      // Criar variações
      const variacoes = [];
      
      if (bairroNormalizado && bairroNormalizado.length > 2) {
        variacoes.push(`${enderecoLimpo}, ${bairroNormalizado}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`);
      }
      
      variacoes.push(`${enderecoLimpo}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`);
      variacoes.push(`${cidadeNormalizada}, ${estadoNormalizado}, Brasil`);

      console.log('🔍 [TEST] Variações criadas:', variacoes);

      for (let i = 0; i < variacoes.length; i++) {
        const enderecoCompleto = variacoes[i];
        console.log(`📍 [TEST] Tentativa ${i + 1}: ${enderecoCompleto}`);
        
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1&countrycodes=br`;
          
          console.log(`🌐 [TEST] URL: ${url}`);
          
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'SegTrack-Test/1.0'
            }
          });
          
          if (!response.ok) {
            console.log(`⚠️ [TEST] Resposta não OK: ${response.status} ${response.statusText}`);
            continue;
          }
          
          const data = await response.json();
          console.log(`📋 [TEST] Resposta:`, data);
          
          if (data && data.length > 0) {
            const result = {
              latitude: parseFloat(data[0].lat),
              longitude: parseFloat(data[0].lon)
            };
            console.log(`✅ [TEST] Coordenadas encontradas:`, result);
            return result;
          }
        } catch (error) {
          console.error(`❌ [TEST] Erro na tentativa ${i + 1}:`, error);
        }
        
        if (i < variacoes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log('⚠️ [TEST] Nenhuma coordenada encontrada');
      return { latitude: null, longitude: null };
    } catch (error) {
      console.error('❌ [TEST] Erro geral:', error);
      return { latitude: null, longitude: null };
    }
  }

  // Testar com diferentes endereços
  const testes = [
    {
      nome: 'Teste 1 - Endereço completo',
      endereco: 'Rua das Flores, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    {
      nome: 'Teste 2 - Endereço simples',
      endereco: 'Avenida Paulista',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    {
      nome: 'Teste 3 - Apenas cidade',
      endereco: 'Centro',
      bairro: '',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    {
      nome: 'Teste 4 - Endereço com caracteres especiais',
      endereco: 'Rua XV de Novembro, 100',
      bairro: 'Centro',
      cidade: 'Curitiba',
      estado: 'PR'
    }
  ];

  for (const teste of testes) {
    console.log('\n' + '='.repeat(50));
    console.log(`🧪 ${teste.nome}`);
    console.log('='.repeat(50));
    
    const resultado = await getCoordinates(teste.endereco, teste.cidade, teste.estado, teste.bairro);
    
    console.log(`📊 Resultado:`, {
      endereco: teste.endereco,
      cidade: teste.cidade,
      estado: teste.estado,
      bairro: teste.bairro,
      coordenadas: resultado
    });
    
    if (resultado.latitude && resultado.longitude) {
      console.log('✅ SUCESSO - Coordenadas obtidas');
    } else {
      console.log('❌ FALHA - Não foi possível obter coordenadas');
    }
  }
}

// Executar o teste
testGeocodificacao().catch(console.error); 