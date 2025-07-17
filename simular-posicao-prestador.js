const axios = require('axios');

// Configuração
const API_BASE = 'http://localhost:8080';
const PRESTADOR_ID = 1; // ID do prestador Yago Gouvea
const OCORRENCIA_ID = 1; // ID da ocorrência de teste

// Coordenadas de teste (São Paulo)
const coordenadasIniciais = {
  latitude: -23.55052,
  longitude: -46.633308
};

const coordenadasDestino = {
  latitude: -23.55052,
  longitude: -46.633308
};

// Função para calcular nova posição (simulando movimento)
function calcularNovaPosicao(posicaoAtual, destino, velocidade = 0.0001) {
  const dx = destino.longitude - posicaoAtual.longitude;
  const dy = destino.latitude - posicaoAtual.latitude;
  const distancia = Math.sqrt(dx * dx + dy * dy);
  
  if (distancia < 0.0001) {
    return destino; // Chegou ao destino
  }
  
  const fator = velocidade / distancia;
  
  return {
    latitude: posicaoAtual.latitude + (dy * fator),
    longitude: posicaoAtual.longitude + (dx * fator)
  };
}

// Função para simular velocidade baseada na distância
function simularVelocidade(distancia) {
  if (distancia < 0.001) return 0; // Parado
  if (distancia < 0.01) return 0.00005; // Lento
  return 0.0001; // Normal
}

async function simularPosicaoPrestador() {
  console.log('🚗 Iniciando simulação de posição do prestador...');
  console.log(`📍 Prestador ID: ${PRESTADOR_ID}`);
  console.log(`📍 Ocorrência ID: ${OCORRENCIA_ID}`);
  
  let posicaoAtual = { ...coordenadasIniciais };
  let tentativas = 0;
  const maxTentativas = 100;
  
  while (tentativas < maxTentativas) {
    try {
      // Calcular distância até o destino
      const dx = coordenadasDestino.longitude - posicaoAtual.longitude;
      const dy = coordenadasDestino.latitude - posicaoAtual.latitude;
      const distancia = Math.sqrt(dx * dx + dy * dy);
      
      // Simular velocidade baseada na distância
      const velocidade = simularVelocidade(distancia);
      
      // Calcular nova posição
      const novaPosicao = calcularNovaPosicao(posicaoAtual, coordenadasDestino, velocidade);
      
      // Simular dados do GPS
      const dadosPosicao = {
        latitude: novaPosicao.latitude,
        longitude: novaPosicao.longitude,
        velocidade: velocidade * 100000, // Converter para km/h
        direcao: Math.atan2(dy, dx) * 180 / Math.PI, // Direção em graus
        altitude: 800 + Math.random() * 50, // Altitude simulada
        precisao: 5 + Math.random() * 10, // Precisão simulada
        bateria: 80 + Math.random() * 20, // Bateria simulada
        sinal_gps: 70 + Math.random() * 30, // Sinal GPS simulado
        ocorrencia_id: OCORRENCIA_ID,
        observacoes: 'Posição simulada para teste'
      };
      
      console.log(`📍 Posição ${tentativas + 1}: ${novaPosicao.latitude.toFixed(6)}, ${novaPosicao.longitude.toFixed(6)}`);
      console.log(`🚗 Velocidade: ${(velocidade * 100000).toFixed(1)} km/h`);
      console.log(`📏 Distância até destino: ${(distancia * 111000).toFixed(1)} km`);
      
      // Enviar posição para a API
      const response = await axios.post(`${API_BASE}/api/rastreamento/posicao`, dadosPosicao, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtcHJlc3RhZG9yIiwibm9tZSI6IllhZ28gR291dmVhIiwiZW1haWwiOiJ5YWdvQHNlZ3RyYWNrcHIuY29tLmJyIiwidGlwbyI6InByZXN0YWRvciIsImlhdCI6MTczNzE3NDg0NywiZXhwIjoxNzM3MjE4MDQ3fQ.test-token',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Posição enviada com sucesso: ${response.data.message}`);
      
      // Atualizar posição atual
      posicaoAtual = novaPosicao;
      
      // Verificar se chegou ao destino
      if (distancia < 0.0001) {
        console.log('🎯 Prestador chegou ao destino!');
        break;
      }
      
      // Aguardar antes da próxima atualização
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos
      tentativas++;
      
    } catch (error) {
      console.error('❌ Erro ao enviar posição:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      
      // Aguardar um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log('🏁 Simulação concluída!');
}

// Função para testar a API de rastreamento
async function testarAPIRastreamento() {
  try {
    console.log('🧪 Testando API de rastreamento...');
    
    // Testar rota de posições do prestador
    const response = await axios.get(`${API_BASE}/api/rastreamento/prestador/${PRESTADOR_ID}`, {
      params: {
        ocorrencia_id: OCORRENCIA_ID
      }
    });
    
    console.log('✅ API de rastreamento funcionando!');
    console.log(`📊 Posições encontradas: ${response.data.total_posicoes}`);
    
    if (response.data.posicoes && response.data.posicoes.length > 0) {
      const ultimaPosicao = response.data.posicoes[0];
      console.log('📍 Última posição:', {
        latitude: ultimaPosicao.latitude,
        longitude: ultimaPosicao.longitude,
        timestamp: ultimaPosicao.timestamp
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API de rastreamento:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
  }
}

// Executar testes
async function main() {
  console.log('🚀 Iniciando testes de rastreamento...\n');
  
  // Primeiro testar a API
  await testarAPIRastreamento();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Depois simular posições
  await simularPosicaoPrestador();
}

main().catch(console.error); 