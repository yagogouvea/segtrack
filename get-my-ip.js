const https = require('https');

console.log('🌐 Descobrindo seu IP atual...');
console.log('==============================');

async function getMyIP() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.ipify.org',
      port: 443,
      path: '/',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data.trim());
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function main() {
  try {
    const ip = await getMyIP();
    
    console.log(`\n✅ Seu IP atual é: ${ip}`);
    console.log('\n📋 Para configurar no Security Group AWS:');
    console.log(`   Source: ${ip}/32`);
    
    console.log('\n🔧 Passos para configurar:');
    console.log('   1. Acesse AWS Console > RDS > Databases');
    console.log('   2. Clique na instância segtrackdb');
    console.log('   3. Vá em "Connectivity & security" > "VPC security groups"');
    console.log('   4. Clique em "Inbound rules" > "Edit inbound rules"');
    console.log('   5. Adicione regra:');
    console.log('      - Type: PostgreSQL');
    console.log('      - Protocol: TCP');
    console.log('      - Port: 5432');
    console.log(`      - Source: ${ip}/32`);
    console.log('   6. Salve as regras');
    
    console.log('\n🧪 Após configurar, teste com:');
    console.log('   node diagnostico-completo.js');
    
  } catch (error) {
    console.error('❌ Erro ao descobrir IP:', error.message);
    console.log('\n💡 Alternativas:');
    console.log('   - Acesse: https://whatismyipaddress.com/');
    console.log('   - Execute: curl ifconfig.me');
    console.log('   - Execute: nslookup myip.opendns.com resolver1.opendns.com');
  }
}

main(); 