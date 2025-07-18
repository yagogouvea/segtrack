const axios = require('axios');

async function testarLoginCEBBS() {
  try {
    console.log('🧪 Testando login do cliente CEBBS...');
    
    const cnpj = '14117458000130';
    const senha = '14117458000130';
    
    console.log('📝 Credenciais:');
    console.log('   CNPJ:', cnpj);
    console.log('   Senha:', senha);
    
    const response = await axios.post('http://localhost:8080/api/auth/cliente-auth/login', {
      cnpj: cnpj,
      senha: senha
    });
    
    console.log('✅ Login realizado com sucesso!');
    console.log('🔑 Token recebido:', response.data.token ? 'Sim' : 'Não');
    console.log('👤 Dados do cliente:', response.data.cliente);
    
    // Testar acesso a dados do cliente com o token
    console.log('\n🔍 Testando acesso aos dados do cliente...');
    
    const token = response.data.token;
    const clienteResponse = await axios.get('http://localhost:8080/api/clientes/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Dados do cliente obtidos com sucesso:');
    console.log('   Nome:', clienteResponse.data.nome);
    console.log('   Nome Fantasia:', clienteResponse.data.nome_fantasia);
    console.log('   CNPJ:', clienteResponse.data.cnpj);
    console.log('   Cidade:', clienteResponse.data.cidade);
    console.log('   Estado:', clienteResponse.data.estado);
    
  } catch (error) {
    console.error('❌ Erro no teste de login:', error.response?.data || error.message);
  }
}

testarLoginCEBBS(); 