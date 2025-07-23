const axios = require('axios');

const API_BASE = 'https://api.painelsegtrack.com.br/api/v1';

async function testarGeracaoUsuario() {
  try {
    console.log('🧪 Testando funcionalidade de geração de usuários prestadores...\n');

    // 1. Buscar prestadores
    console.log('1️⃣ Buscando prestadores...');
    const prestadoresResponse = await axios.get(`${API_BASE}/prestadores`);
    const prestadores = prestadoresResponse.data.data || prestadoresResponse.data;
    
    if (!prestadores || prestadores.length === 0) {
      console.log('❌ Nenhum prestador encontrado');
      return;
    }

    console.log(`✅ Encontrados ${prestadores.length} prestadores`);

    // 2. Verificar status de usuário para cada prestador
    console.log('\n2️⃣ Verificando status de usuários...');
    for (const prestador of prestadores.slice(0, 3)) { // Testar apenas os 3 primeiros
      console.log(`\n📋 Prestador: ${prestador.nome} (ID: ${prestador.id})`);
      
      try {
        const statusResponse = await axios.get(`${API_BASE}/prestadores/${prestador.id}/verificar-usuario`);
        const status = statusResponse.data;
        
        console.log(`   📧 Email: ${prestador.email || 'Não informado'}`);
        console.log(`   🆔 CPF: ${prestador.cpf || 'Não informado'}`);
        console.log(`   👤 Tem usuário: ${status.tem_usuario ? '✅ Sim' : '❌ Não'}`);
        console.log(`   🔧 Pode gerar: ${status.pode_gerar ? '✅ Sim' : '❌ Não'}`);
        
        if (status.tem_usuario) {
          console.log(`   📧 Email do usuário: ${status.usuario.email}`);
          console.log(`   🟢 Status: ${status.usuario.ativo ? 'Ativo' : 'Inativo'}`);
        }
        
        // 3. Tentar gerar usuário se possível
        if (status.pode_gerar) {
          console.log(`   🔧 Tentando gerar usuário...`);
          try {
            const gerarResponse = await axios.post(`${API_BASE}/prestadores/${prestador.id}/gerar-usuario`);
            console.log(`   ✅ Usuário gerado com sucesso!`);
            console.log(`   📧 Email: ${gerarResponse.data.credenciais.email}`);
            console.log(`   🔑 Senha: ${gerarResponse.data.credenciais.senha}`);
          } catch (gerarError) {
            console.log(`   ❌ Erro ao gerar usuário: ${gerarError.response?.data?.error || gerarError.message}`);
          }
        } else if (!status.tem_usuario) {
          console.log(`   ⚠️ Não é possível gerar usuário (falta email ou CPF)`);
        }
        
      } catch (statusError) {
        console.log(`   ❌ Erro ao verificar status: ${statusError.response?.data?.error || statusError.message}`);
      }
    }

    console.log('\n✅ Teste concluído!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executar o teste
testarGeracaoUsuario(); 