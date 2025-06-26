const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Configurações
const API_URL = 'http://localhost:3001';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

// Criar uma imagem de teste se não existir
function createTestImage() {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('Criando imagem de teste...');
    // Criar um arquivo de teste simples
    const testData = Buffer.from('fake image data');
    fs.writeFileSync(TEST_IMAGE_PATH, testData);
  }
}

async function testHealth() {
  try {
    console.log('1. Testando health check...');
    const response = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Health check OK:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check falhou:', error.message);
    return false;
  }
}

async function testUploadWithoutAuth() {
  try {
    console.log('\n2. Testando upload sem autenticação...');
    const formData = new FormData();
    formData.append('foto', fs.createReadStream(TEST_IMAGE_PATH));
    
    const response = await axios.post(`${API_URL}/api/fotos/test`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 10000
    });
    
    console.log('✅ Upload sem auth OK:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Upload sem auth falhou:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
}

async function testUploadWithAuth() {
  try {
    console.log('\n3. Testando upload com autenticação...');
    const formData = new FormData();
    formData.append('foto', fs.createReadStream(TEST_IMAGE_PATH));
    formData.append('ocorrenciaId', '1');
    formData.append('legenda', 'Teste de upload');
    
    const response = await axios.post(`${API_URL}/api/fotos`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer debug-token'
      },
      timeout: 10000
    });
    
    console.log('✅ Upload com auth OK:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Upload com auth falhou:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
}

async function testUploadWithAuthSimulated() {
  try {
    console.log('\n4. Testando upload com auth simulada...');
    const formData = new FormData();
    formData.append('foto', fs.createReadStream(TEST_IMAGE_PATH));
    
    const response = await axios.post(`${API_URL}/api/fotos/test-auth`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer debug-token'
      },
      timeout: 10000
    });
    
    console.log('✅ Upload com auth simulada OK:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Upload com auth simulada falhou:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
}

async function testCORS() {
  try {
    console.log('\n5. Testando CORS...');
    const response = await axios.get(`${API_URL}/api/health`, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('✅ CORS OK:', response.headers['access-control-allow-origin']);
    return true;
  } catch (error) {
    console.error('❌ CORS falhou:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Iniciando testes completos de upload...\n');
  
  createTestImage();
  
  const results = {
    health: await testHealth(),
    uploadWithoutAuth: await testUploadWithoutAuth(),
    uploadWithAuth: await testUploadWithAuth(),
    uploadWithAuthSimulated: await testUploadWithAuthSimulated(),
    cors: await testCORS()
  };
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('=====================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSOU' : 'FALHOU'}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('O upload de fotos deve estar funcionando corretamente.');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM!');
    console.log('Verifique os logs acima para identificar os problemas.');
  }
  
  return allPassed;
}

// Executar testes
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Erro fatal nos testes:', error);
  process.exit(1);
}); 