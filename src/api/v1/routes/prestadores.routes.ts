import { Router } from 'express';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';
import { PrestadorController } from '../../../controllers/prestador.controller';
import { ensurePrisma } from '../../../lib/prisma';

const router = Router();
const controller = new PrestadorController();

// 🔹 ROTA - Listar prestadores para popup de seleção (nome e codinome) - PÚBLICA
router.get('/popup', async (_req, res) => {
  try {
    const db = await ensurePrisma();
    const prestadores = await db.prestador.findMany({
      select: {
        id: true,
        nome: true,
        cod_nome: true,
        telefone: true,
        cidade: true,
        estado: true,
        funcoes: {
          select: {
            funcao: true
          }
        },
        regioes: {
          select: {
            regiao: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    // Transformar funções e regiões para arrays simples
    const prestadoresFormatados = prestadores.map((p: any) => ({
      ...p,
      funcoes: p.funcoes.map((f: any) => f.funcao),
      regioes: p.regioes.map((r: any) => r.regiao)
    }));

    res.json(prestadoresFormatados);
  } catch (err) {
    console.error('❌ Erro ao buscar prestadores para popup:', err);
    res.status(500).json({ erro: 'Erro ao buscar prestadores' });
  }
});

// ✅ ROTA - Buscar prestador por nome (usado no popup de passagem de serviço) - PÚBLICA
router.get('/buscar-por-nome/:nome', async (req, res) => {
  const { nome } = req.params;

  try {
    const db = await ensurePrisma();
    const prestador = await db.prestador.findFirst({
      where: {
        nome: {
          contains: nome
        }
      },
      select: {
        nome: true,
        telefone: true
      }
    });

    if (!prestador) {
      return res.status(404).json({ erro: 'Prestador não encontrado' });
    }

    return res.json(prestador);
  } catch (err) {
    console.error('❌ Erro ao buscar prestador por nome:', err);
    return res.status(500).json({ erro: 'Erro ao buscar prestador' });
  }
});

// ✅ ROTA - Buscar prestadores por termo de busca (usado no autocomplete) - PÚBLICA
router.get('/buscar', async (req, res) => {
  const { q } = req.query;

  try {
    const db = await ensurePrisma();
    const prestadores = await db.prestador.findMany({
      where: {
        nome: {
          contains: String(q || ''),
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        nome: true,
        cod_nome: true
      },
      orderBy: { nome: 'asc' },
      take: 10
    });

    return res.json(prestadores);
  } catch (err) {
    console.error('❌ Erro ao buscar prestadores:', err);
    return res.status(500).json({ erro: 'Erro ao buscar prestadores' });
  }
});

// Rotas públicas
router.get('/public', controller.listPublic);

// Middleware de autenticação para rotas protegidas
router.use(authenticateToken);

// Rotas protegidas
router.get('/', controller.list);
router.get('/mapa', controller.mapa);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Endpoint para gerar usuário e senha para prestador
router.post('/:id/gerar-usuario', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await ensurePrisma();
    
    if (!db) {
      return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
    }

    // Buscar o prestador
    const prestador = await db.prestador.findUnique({
      where: { id: Number(id) }
    });

    if (!prestador) {
      return res.status(404).json({ error: 'Prestador não encontrado' });
    }

    // Verificar se já existe usuário para este prestador
    const usuarioExistente = await db.usuarioPrestador.findFirst({
      where: { prestador_id: Number(id) }
    });

    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'Usuário já existe para este prestador',
        usuario: {
          email: usuarioExistente.email,
          ativo: usuarioExistente.ativo
        }
      });
    }

    // Verificar se o prestador tem email e CPF
    if (!prestador.email || !prestador.cpf) {
      return res.status(400).json({ 
        error: 'Prestador deve ter email e CPF para gerar usuário' 
      });
    }

    // Gerar senha hash usando o CPF como senha
    const bcrypt = require('bcrypt');
    const cpfLimpo = prestador.cpf.replace(/\D/g, '');
    const senha_hash = await bcrypt.hash(cpfLimpo, 10);

    // Criar usuário prestador
    const novoUsuario = await db.usuarioPrestador.create({
      data: {
        prestador_id: Number(id),
        email: prestador.email,
        senha_hash,
        ativo: true,
        primeiro_acesso: true
      }
    });

    console.log(`✅ Usuário criado para prestador ${prestador.nome} (${prestador.email})`);

    res.json({
      message: 'Usuário criado com sucesso',
      usuario: {
        id: novoUsuario.id,
        email: novoUsuario.email,
        ativo: novoUsuario.ativo,
        primeiro_acesso: novoUsuario.primeiro_acesso
      },
      credenciais: {
        email: prestador.email,
        senha: cpfLimpo // CPF como senha
      }
    });

  } catch (error) {
    console.error('❌ Erro ao gerar usuário para prestador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para verificar se prestador tem usuário
router.get('/:id/verificar-usuario', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await ensurePrisma();
    
    if (!db) {
      return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
    }

    // Buscar o prestador
    const prestador = await db.prestador.findUnique({
      where: { id: Number(id) }
    });

    if (!prestador) {
      return res.status(404).json({ error: 'Prestador não encontrado' });
    }

    // Verificar se existe usuário para este prestador
    const usuario = await db.usuarioPrestador.findFirst({
      where: { prestador_id: Number(id) }
    });

    res.json({
      prestador_id: Number(id),
      tem_usuario: !!usuario,
      pode_gerar: !usuario && prestador.email && prestador.cpf,
      usuario: usuario ? {
        email: usuario.email,
        ativo: usuario.ativo,
        primeiro_acesso: usuario.primeiro_acesso
      } : null
    });

  } catch (error) {
    console.error('❌ Erro ao verificar usuário do prestador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 