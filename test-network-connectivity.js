const net = require('net');
const dns = require('dns').promises;

console.log('🌐 TESTE DE CONECTIVIDADE DE REDE - AWS RDS');
console.log('==========================================');

const HOST = 'segtrackdb.cyv2oismclv3.us-east-1.rds.amazonaws.com';
const PORT = 5432;

async function testDNS() {
  console.log('\n🔍 1. Testando resolução DNS...');
  try {
    const addresses = await dns.resolve4(HOST);
    console.log(`✅ DNS resolvido: ${addresses.join(', ')}`);
    return addresses[0];
  } catch (error) {
    console.log(`❌ Erro DNS: ${error.message}`);
    return null;
  }
}

function testPort(host, port, timeout = 5000) {
  return new Promise((resolve) => {
    console.log(`🔍 2. Testando conectividade na porta ${port}...`);
    
    const socket = new net.Socket();
    let resolved = false;
    
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        console.log(`❌ Timeout na porta ${port} (${timeout}ms)`);
        resolve({ success: false, error: 'timeout' });
      }
    }, timeout);
    
    socket.on('connect', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        console.log(`✅ Porta ${port} acessível!`);
        socket.destroy();
        resolve({ success: true });
      }
    });
    
    socket.on('error', (error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        console.log(`❌ Erro na porta ${port}: ${error.code || error.message}`);
        resolve({ success: false, error: error.code || error.message });
      }
    });
    
    socket.connect(port, host);
  });
}

async function testPing(host) {
  console.log('\n🔍 3. Testando ping (simulado)...');
  
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    const ping = spawn('ping', ['-n', '4', host]); // Windows
    
    let output = '';
    
    ping.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ping.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    ping.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Ping bem-sucedido');
        resolve({ success: true });
      } else {
        console.log('❌ Ping falhou');
        console.log('Output:', output);
        resolve({ success: false, output });
      }
    });
  });
}

async function runNetworkTests() {
  console.log(`⏰ Iniciando testes em: ${new Date().toLocaleString()}`);
  
  // Teste DNS
  const ip = await testDNS();
  if (!ip) {
    console.log('\n❌ Problema de DNS detectado. Verifique conectividade de rede.');
    return;
  }
  
  // Teste ping
  await testPing(HOST);
  
  // Teste porta
  const portResult = await testPort(ip, PORT, 10000);
  
  // Análise dos resultados
  console.log('\n📊 ANÁLISE DOS RESULTADOS');
  console.log('=========================');
  
  if (!portResult.success) {
    console.log('\n🔧 PROBLEMA IDENTIFICADO: Security Group/Firewall');
    console.log('\n💡 SOLUÇÕES:');
    console.log('\n1. AWS Console - Security Group:');
    console.log('   - Acesse AWS Console > RDS > Databases');
    console.log('   - Clique na instância segtrackdb');
    console.log('   - Vá em "Connectivity & security" > "VPC security groups"');
    console.log('   - Clique no Security Group');
    console.log('   - Em "Inbound rules", adicione:');
    console.log('     Type: PostgreSQL');
    console.log('     Protocol: TCP');
    console.log('     Port: 5432');
    console.log('     Source: Seu IP atual ou 0.0.0.0/0 (temporariamente)');
    
    console.log('\n2. Verificar IP atual:');
    console.log('   - Acesse: https://whatismyipaddress.com/');
    console.log('   - Use esse IP no Security Group');
    
    console.log('\n3. Comandos para verificar:');
    console.log(`   - ping ${HOST}`);
    console.log(`   - telnet ${HOST} ${PORT}`);
    console.log(`   - nslookup ${HOST}`);
    
    console.log('\n4. Alternativas temporárias:');
    console.log('   - Use 0.0.0.0/0 como source (permite qualquer IP)');
    console.log('   - Configure apenas seu IP específico para segurança');
    
  } else {
    console.log('\n✅ Conectividade de rede OK!');
    console.log('O problema pode ser:');
    console.log('- Credenciais incorretas');
    console.log('- Banco não existe');
    console.log('- Usuário sem permissão');
  }
  
  console.log(`\n⏰ Testes concluídos em: ${new Date().toLocaleString()}`);
}

runNetworkTests(); 