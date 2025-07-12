const https = require('https');
const http = require('http');

// Função para fazer requisições HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testarAtualizacaoComGeocodificacao() {
  try {
    console.log('🔍 Testando atualização de prestador com geocodificação...');
    
    // 1. Buscar um prestador existente via API
    const response = await makeRequest('http://localhost:8080/api/prestadores?page=1&pageSize=1');
    
    if (response.status !== 200) {
      console.log('❌ Erro ao buscar prestadores:', response.status);
      return;
    }
    
    const data = response.data;
    if (!data.data || data.data.length === 0) {
      console.log('❌ Nenhum prestador encontrado');
      return;
    }
    
    const prestador = data.data[0];
    console.log('📍 Prestador encontrado:', {
      id: prestador.id,
      nome: prestador.nome,
      endereco: prestador.endereco,
      cidade: prestador.cidade,
      estado: prestador.estado,
      latitude: prestador.latitude,
      longitude: prestador.longitude
    });
    
    // 2. Preparar dados para atualização (modificar endereço)
    const dadosAtualizacao = {
      ...prestador,
      endereco: prestador.endereco + ' (TESTE ATUALIZAÇÃO)',
      funcoes: prestador.funcoes || [],
      regioes: prestador.regioes || [],
      veiculos: prestador.veiculos || []
    };
    
    console.log('🔄 Atualizando prestador com novo endereço...');
    console.log('📍 Novo endereço:', dadosAtualizacao.endereco);
    
    // 3. Fazer a atualização via API
    const updateResponse = await makeRequest(`http://localhost:8080/api/prestadores/${prestador.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosAtualizacao)
    });
    
    if (updateResponse.status !== 200) {
      console.error('❌ Erro na atualização:', updateResponse.status, updateResponse.data);
      return;
    }
    
    const prestadorAtualizado = updateResponse.data;
    console.log('✅ Prestador atualizado:', {
      id: prestadorAtualizado.id,
      nome: prestadorAtualizado.nome,
      endereco: prestadorAtualizado.endereco,
      cidade: prestadorAtualizado.cidade,
      estado: prestadorAtualizado.estado,
      latitude: prestadorAtualizado.latitude,
      longitude: prestadorAtualizado.longitude
    });
    
    // 4. Verificar se as coordenadas foram atualizadas
    if (prestadorAtualizado.latitude && prestadorAtualizado.longitude) {
      console.log('✅ Coordenadas atualizadas com sucesso!');
      console.log('📍 Coordenadas antigas:', { latitude: prestador.latitude, longitude: prestador.longitude });
      console.log('📍 Coordenadas novas:', { latitude: prestadorAtualizado.latitude, longitude: prestadorAtualizado.longitude });
    } else {
      console.log('⚠️ Coordenadas não foram atualizadas');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testarAtualizacaoComGeocodificacao(); 