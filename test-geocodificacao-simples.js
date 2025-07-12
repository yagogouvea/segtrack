const https = require('https');

// Função para geocodificar endereço
async function geocodificarEndereco(endereco, cidade, estado) {
  try {
    const enderecoCompleto = `${endereco}, ${cidade}, ${estado}, Brasil`;
    console.log('🔍 Geocodificando:', enderecoCompleto);
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1`;
    
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
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
            resolve({ latitude: null, longitude: null });
          }
        });
      }).on('error', (error) => {
        console.error('❌ Erro na requisição:', error);
        resolve({ latitude: null, longitude: null });
      });
    });
  } catch (error) {
    console.error('❌ Erro na geocodificação:', error);
    return { latitude: null, longitude: null };
  }
}

async function testarGeocodificacao() {
  console.log('🧪 Testando geocodificação...\n');
  
  const enderecosTeste = [
    {
      endereco: 'Rua das Flores',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    {
      endereco: 'Avenida Paulista',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    {
      endereco: 'Rua Augusta',
      cidade: 'São Paulo',
      estado: 'SP'
    }
  ];
  
  for (const endereco of enderecosTeste) {
    console.log(`📍 Testando: ${endereco.endereco}, ${endereco.cidade}, ${endereco.estado}`);
    const coordenadas = await geocodificarEndereco(endereco.endereco, endereco.cidade, endereco.estado);
    console.log('---');
  }
  
  console.log('✅ Teste de geocodificação concluído!');
}

testarGeocodificacao(); 