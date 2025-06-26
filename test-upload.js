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

async function testUpload() {
  try {
    console.log('🧪 Iniciando teste de upload...');
    
    // Verificar se o servidor está rodando
    console.log('1. Verificando se o servidor está rodando...');
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    console.log('✅ Servidor está rodando:', healthResponse.data);
    
    // Testar upload sem autenticação
    console.log('\n2. Testando upload sem autenticação...');
    const formData = new FormData();
    formData.append('foto', fs.createReadStream(TEST_IMAGE_PATH));
    
    const uploadResponse = await axios.post(`${API_URL}/api/fotos/test`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 10000
    });
    
    console.log('✅ Upload de teste realizado com sucesso:', uploadResponse.data);
    
    // Testar upload com autenticação (se token disponível)
    const token = process.env.TEST_TOKEN;
    if (token) {
      console.log('\n3. Testando upload com autenticação...');
      const authFormData = new FormData();
      authFormData.append('foto', fs.createReadStream(TEST_IMAGE_PATH));
      authFormData.append('ocorrenciaId', '1');
      authFormData.append('legenda', 'Teste de upload');
      
      const authUploadResponse = await axios.post(`${API_URL}/api/fotos`, authFormData, {
        headers: {
          ...authFormData.getHeaders(),
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });
      
      console.log('✅ Upload autenticado realizado com sucesso:', authUploadResponse.data);
    } else {
      console.log('\n⚠️  Token de teste não fornecido. Pule o teste de upload autenticado.');
    }
    
    console.log('\n🎉 Todos os testes passaram!');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Executar teste
createTestImage();
testUpload(); 