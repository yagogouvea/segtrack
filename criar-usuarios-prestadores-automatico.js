const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function criarUsuariosPrestadoresAutomatico() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Criando usuários prestadores automaticamente...');
    
    // Buscar todos os prestadores
    const prestadores = await prisma.prestador.findMany({
      include: {
        usuarios: true
      }
    });
    
    console.log(`📋 Encontrados ${prestadores.length} prestadores no total`);
    
    let criados = 0;
    let atualizados = 0;
    
    for (const prestador of prestadores) {
      console.log(`\n🔍 Processando prestador: ${prestador.nome} (CPF: ${prestador.cpf})`);
      
      // Verificar se já existe usuário prestador
      const usuarioExistente = await prisma.usuarioPrestador.findFirst({
        where: { prestador_id: prestador.id }
      });
      
      if (usuarioExistente) {
        console.log(`✅ Usuário já existe para ${prestador.nome}`);
        
        // Verificar se a senha está correta (CPF)
        const senhaValida = await bcrypt.compare(prestador.cpf, usuarioExistente.senha_hash);
        
        if (!senhaValida) {
          console.log(`🔧 Atualizando senha para CPF: ${prestador.cpf}`);
          
          // Atualizar senha para o CPF
          const senhaHash = await bcrypt.hash(prestador.cpf, 10);
          
          await prisma.usuarioPrestador.update({
            where: { id: usuarioExistente.id },
            data: {
              senha_hash: senhaHash
            }
          });
          
          atualizados++;
          console.log(`✅ Senha atualizada para ${prestador.nome}`);
        } else {
          console.log(`✅ Senha já está correta para ${prestador.nome}`);
        }
      } else {
        console.log(`➕ Criando novo usuário para ${prestador.nome}`);
        
        // Criar email baseado no nome (se não existir)
        let email = prestador.email;
        if (!email) {
          // Gerar email baseado no nome
          const nomeLimpo = prestador.nome.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais
            .substring(0, 20);
          email = `${nomeLimpo}@segtrackpr.com.br`;
        }
        
        // Gerar hash da senha (CPF)
        const senhaHash = await bcrypt.hash(prestador.cpf, 10);
        
        // Criar usuário prestador
        await prisma.usuarioPrestador.create({
          data: {
            prestador_id: prestador.id,
            email: email,
            senha_hash: senhaHash,
            ativo: true,
            primeiro_acesso: true
          }
        });
        
        criados++;
        console.log(`✅ Usuário criado para ${prestador.nome} com email: ${email}`);
      }
    }
    
    console.log(`\n📊 Resumo:`);
    console.log(`- Usuários criados: ${criados}`);
    console.log(`- Senhas atualizadas: ${atualizados}`);
    console.log(`- Total processados: ${prestadores.length}`);
    
    // Listar todos os usuários prestadores criados
    console.log(`\n📋 Lista de usuários prestadores:`);
    const usuariosPrestadores = await prisma.usuarioPrestador.findMany({
      include: {
        prestador: true
      }
    });
    
    usuariosPrestadores.forEach(u => {
      console.log(`- Email: ${u.email}, Prestador: ${u.prestador?.nome}, Ativo: ${u.ativo}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criarUsuariosPrestadoresAutomatico(); 