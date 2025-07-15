const axios = require('axios');

// CNPJ do cliente SASCAR
const cnpj = '03.112.879/0001-51';
// Normaliza o CNPJ (remove pontos, barras e traços)
const normalizedCnpj = cnpj.replace(/\D/g, '');

const payload = {
  cnpj: normalizedCnpj, // Enviar CNPJ sem formatação
  senha: normalizedCnpj // CNPJ normalizado como senha
};

const apiUrl = 'http://localhost:8080/api/auth/cliente-auth/login'; // Nova rota de autenticação

async function testarNovoLogin() {
  try {
    console.log('🔐 Testando NOVO login para o cliente SASCAR...');
    console.log('📡 URL:', apiUrl);
    console.log('📦 Payload:', payload);
    const response = await axios.post(apiUrl, payload);
    console.log('✅ Login realizado com sucesso!');
    console.log('Resposta:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('❌ Falha no login. Status:', error.response.status);
      console.error('Mensagem:', error.response.data);
    } else {
      console.error('❌ Erro ao conectar na API:', error.message);
    }
  }
}

testarNovoLogin(); 