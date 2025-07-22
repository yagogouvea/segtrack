const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function criarPrestadorTeste() {
  try {
    console.log('🔧 Criando prestador de teste...');

    // Primeiro, criar o prestador
    const prestador = await prisma.prestador.create({
      data: {
        nome: 'João Silva',
        cpf: '12345678901',
        telefone: '(11) 99999-9999',
        email: 'joao.silva@exemplo.com',
        aprovado: true,
        cidade: 'São Paulo',
        estado: 'SP',
        valor_acionamento: 150.0,
        franquia_horas: '4',
        franquia_km: 50.0,
        valor_hora_adc: 25.0,
        valor_km_adc: 2.5,
        latitude: -23.5505,
        longitude: -46.6333,
        modelo_antena: 'GPS Garmin'
      }
    });

    console.log('✅ Prestador criado:', prestador);

    // Depois, criar o usuário prestador
    const usuarioPrestador = await prisma.usuarioPrestador.create({
      data: {
        prestador_id: prestador.id,
        email: 'prestador@exemplo.com',
        senha_hash: 'prestador@exemplo.com', // Senha simples para teste
        ativo: true,
        primeiro_acesso: false
      }
    });

    console.log('✅ Usuário prestador criado:', usuarioPrestador);

    // Adicionar funções ao prestador
    await prisma.funcaoPrestador.create({
      data: {
        funcao: 'Antenista',
        prestadorId: prestador.id
      }
    });

    await prisma.funcaoPrestador.create({
      data: {
        funcao: 'Apoio Armado',
        prestadorId: prestador.id
      }
    });

    // Adicionar regiões ao prestador
    await prisma.regiaoPrestador.create({
      data: {
        regiao: 'CAPITAL',
        prestadorId: prestador.id
      }
    });

    await prisma.regiaoPrestador.create({
      data: {
        regiao: 'GRANDE_SP',
        prestadorId: prestador.id
      }
    });

    // Adicionar tipos de veículo
    await prisma.tipoVeiculoPrestador.create({
      data: {
        tipo: 'Moto',
        prestadorId: prestador.id
      }
    });

    await prisma.tipoVeiculoPrestador.create({
      data: {
        tipo: 'Carro',
        prestadorId: prestador.id
      }
    });

    console.log('✅ Funções, regiões e veículos adicionados ao prestador');

    console.log('\n🎉 Prestador de teste criado com sucesso!');
    console.log('📧 Email: prestador@exemplo.com');
    console.log('🔑 Senha: prestador@exemplo.com');
    console.log('👤 Nome: João Silva');
    console.log('📱 Telefone: (11) 99999-9999');

  } catch (error) {
    console.error('❌ Erro ao criar prestador de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criarPrestadorTeste(); 