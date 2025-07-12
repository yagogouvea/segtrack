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
      headers: {
        'User-Agent': 'SegTrack-Test/1.0',
        'Accept': 'application/json',
        ...options.headers
      }
    };

    console.log('🔍 Fazendo requisição para:', url);
    console.log('📋 Headers:', requestOptions.headers);

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('📡 Status da resposta:', res.statusCode);
        console.log('📋 Headers da resposta:', res.headers);
        
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, rawData: data });
        } catch (error) {
          console.error('❌ Erro ao parsear JSON:', error);
          console.log('📄 Dados brutos:', data.substring(0, 500));
          resolve({ status: res.statusCode, data: null, rawData: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error);
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testarAPIMapa() {
  console.log('🧪 Testando API de mapa...\n');
  
  const urls = [
    'http://localhost:8080/api/prestadores/mapa',
    'https://api.painelsegtrack.com.br/api/prestadores/mapa'
  ];
  
  for (const url of urls) {
    console.log(`\n🔍 Testando: ${url}`);
    console.log('─'.repeat(50));
    
    try {
      const response = await makeRequest(url);
      
      console.log('✅ Status:', response.status);
      
      if (response.status === 200) {
        if (Array.isArray(response.data)) {
          console.log('✅ Resposta é um array com', response.data.length, 'itens');
          
          if (response.data.length > 0) {
            const primeiro = response.data[0];
            console.log('📋 Primeiro item:', {
              id: primeiro.id,
              nome: primeiro.nome,
              latitude: primeiro.latitude,
              longitude: primeiro.longitude,
              temCoordenadas: !!(primeiro.latitude && primeiro.longitude)
            });
          }
        } else {
          console.log('❌ Resposta não é um array:', typeof response.data);
          console.log('📄 Conteúdo:', response.data);
        }
      } else {
        console.log('❌ Status de erro:', response.status);
        console.log('📄 Conteúdo:', response.rawData);
      }
      
    } catch (error) {
      console.error('❌ Erro ao testar URL:', error.message);
    }
  }
}

testarAPIMapa(); 