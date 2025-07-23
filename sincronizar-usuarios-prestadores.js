const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function sincronizarUsuariosPrestadores() {
  try {
    console.log('🔄 Iniciando sincronização de usuários prestadores...\n');

    // Buscar todos os prestadores
    const prestadores = await prisma.prestador.findMany({
      include: {
        usuarios: true
      }
    });

    console.log(`📊 Total de prestadores encontrados: ${prestadores.length}`);

    let criados = 0;
    let jaExistem = 0;
    let semEmailOuCPF = 0;

    for (const prestador of prestadores) {
      console.log(`\n📋 Processando: ${prestador.nome} (ID: ${prestador.id})`);
      
      // Verificar se já tem usuário
      if (prestador.usuarios && prestador.usuarios.length > 0) {
        console.log(`   ✅ Já possui usuário: ${prestador.usuarios[0].email}`);
        jaExistem++;
        continue;
      }

      // Verificar se tem email e CPF
      if (!prestador.email || !prestador.cpf) {
        console.log(`   ⚠️ Sem email ou CPF - Email: ${prestador.email || 'Não informado'}, CPF: ${prestador.cpf || 'Não informado'}`);
        semEmailOuCPF++;
        continue;
      }

      // Criar usuário
      try {
        const cpfLimpo = prestador.cpf.replace(/\D/g, '');
        const senha_hash = await bcrypt.hash(cpfLimpo, 10);

        const novoUsuario = await prisma.usuarioPrestador.create({
          data: {
            prestador_id: prestador.id,
            email: prestador.email,
            senha_hash,
            ativo: true,
            primeiro_acesso: true
          }
        });

        console.log(`   ✅ Usuário criado: ${novoUsuario.email} (Senha: ${cpfLimpo})`);
        criados++;

      } catch (error) {
        console.log(`   ❌ Erro ao criar usuário: ${error.message}`);
      }
    }

    console.log('\n📊 Resumo da sincronização:');
    console.log(`   ✅ Usuários criados: ${criados}`);
    console.log(`   🔄 Já existiam: ${jaExistem}`);
    console.log(`   ⚠️ Sem email/CPF: ${semEmailOuCPF}`);
    console.log(`   📊 Total processados: ${prestadores.length}`);

    if (criados > 0) {
      console.log('\n🎉 Sincronização concluída com sucesso!');
      console.log('💡 Os prestadores agora podem fazer login no app usando:');
      console.log('   - Email: o email cadastrado');
      console.log('   - Senha: o CPF (apenas números)');
    } else {
      console.log('\nℹ️ Nenhum usuário novo foi criado.');
    }

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar sincronização
sincronizarUsuariosPrestadores(); 