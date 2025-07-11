import express, { Request, Response } from 'express';
import { ensurePrisma } from '../lib/prisma';
import { PrestadorController } from '../controllers/prestador.controller';

const router = express.Router();
const controller = new PrestadorController();

// GET - Listar todos os prestadores (completo)
// Query params suportados: nome, cod_nome, regioes (csv), funcoes (csv), page, pageSize
router.get('/', (req, res) => controller.list(req, res));

// 🔹 NOVA ROTA - Listar prestadores para popup de seleção (nome e codinome)
router.get('/popup', async (_req: Request, res: Response) => {
  try {
    const db = await ensurePrisma();
    const prestadores = await db.prestador.findMany({
      select: {
        id: true,
        nome: true,
        cod_nome: true
      },
      orderBy: { nome: 'asc' }
    });
    res.json(prestadores);
  } catch (err) {
    console.error('❌ Erro ao buscar prestadores para popup:', err);
    res.status(500).json({ erro: 'Erro ao buscar prestadores' });
  }
});

// ✅ NOVA ROTA - Buscar prestador por nome (usado no popup de passagem de serviço)
// ✅ ROTA CORRIGIDA - Buscar prestador por nome (sem usar `mode`)
router.get('/buscar-por-nome/:nome', async (req: Request, res: Response) => {
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

// ✅ ROTA - Buscar prestadores por termo de busca (usado no autocomplete)
router.get('/buscar', async (req: Request, res: Response) => {
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

// POST - Criar novo prestador
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
      const {
    nome, cpf, cod_nome, telefone, email, aprovado,
    tipo_pix, chave_pix, cep, endereco, bairro, cidade, estado,
    valor_acionamento, franquia_horas, franquia_km, valor_hora_adc, valor_km_adc,
    funcoes, regioes, veiculos, modelo_antena
  } = req.body;

    // Validações básicas
    if (!nome || !cpf) {
      res.status(400).json({ erro: 'Nome e CPF são obrigatórios' });
      return;
    }

    const db = await ensurePrisma();
    // Verificar se já existe um prestador com este CPF
    const existente = await db.prestador.findFirst({ 
      where: { cpf: cpf.replace(/\D/g, '') } 
    });
    
    if (existente) {
      res.status(400).json({ erro: 'Já existe um prestador com este CPF' });
      return;
    }

    // Converter valores numéricos
    const valorAcionamentoFloat = valor_acionamento ? parseFloat(valor_acionamento.toString().replace(/[^\d.,]/g, '').replace(',', '.')) : 0;
    const franquiaKmFloat = franquia_km ? parseFloat(String(franquia_km)) : 0;
    const valorHoraAdcFloat = valor_hora_adc ? parseFloat(valor_hora_adc.toString().replace(/[^\d.,]/g, '').replace(',', '.')) : 0;
    const valorKmAdcFloat = valor_km_adc ? parseFloat(valor_km_adc.toString().replace(/[^\d.,]/g, '').replace(',', '.')) : 0;

    // Processar arrays de funções, regiões e veículos
    const processarFuncoes = (funcs: any[] | null | undefined) => {
      if (!funcs) return [];
      return funcs.map(f => ({
        funcao: typeof f === 'string' ? f : f.funcao || f.nome || String(f)
      }));
    };

    const processarRegioes = (regs: any[] | null | undefined) => {
      if (!regs) return [];
      return regs.map(r => ({
        regiao: typeof r === 'string' ? r : r.regiao || r.nome || String(r)
      }));
    };

    const processarVeiculos = (veics: any[] | null | undefined) => {
      if (!veics) return [];
      return veics.map(v => ({
        tipo: typeof v === 'string' ? v : v.tipo || v.nome || String(v)
      }));
    };

    // Criar o prestador com todas as relações
    const novo = await db.prestador.create({
      data: {
        nome,
        cpf: cpf.replace(/\D/g, ''),
        cod_nome,
        telefone,
        email,
        aprovado: aprovado || false,
        tipo_pix,
        chave_pix,
        cep,
        endereco,
        bairro,
        cidade,
        estado,
        valor_acionamento: valorAcionamentoFloat,
        franquia_horas,
        franquia_km: franquiaKmFloat,
        valor_hora_adc: valorHoraAdcFloat,
        valor_km_adc: valorKmAdcFloat,
        modelo_antena,
        funcoes: {
          create: processarFuncoes(funcoes)
        },
        regioes: {
          create: processarRegioes(regioes)
        },
        veiculos: {
          create: processarVeiculos(veiculos)
        }
      },
      include: {
        funcoes: true,
        regioes: true,
        veiculos: true
      }
    });

    // Formatar a resposta
    const prestadorFormatado = {
      ...novo,
      funcoes: novo.funcoes.map(f => f.funcao),
      regioes: novo.regioes.map(r => r.regiao),
      tipo_veiculo: novo.veiculos.map(v => v.tipo),
      veiculos: novo.veiculos
    };

    console.log('Prestador criado:', prestadorFormatado);
    res.status(201).json(prestadorFormatado);
  } catch (err) {
    console.error('❌ Erro ao criar prestador:', err);
    res.status(500).json({ 
      erro: 'Erro ao criar prestador',
      detalhes: err instanceof Error ? err.message : String(err)
    });
  }
});

// PUT - Atualizar prestador
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('Atualizando prestador:', { id, body: req.body });
  
  const {
    nome, cpf, cod_nome, telefone, email, aprovado,
    tipo_pix, chave_pix, cep, endereco, bairro, cidade, estado,
    valor_acionamento, franquia_horas, franquia_km, valor_hora_adc, valor_km_adc,
    funcoes, regioes, veiculos, modelo_antena
  } = req.body;

  try {
    const db = await ensurePrisma();
    // Converter valores numéricos
    const valorAcionamentoFloat = valor_acionamento ? parseFloat(valor_acionamento.toString().replace(/[^\d.,]/g, '').replace(',', '.')) : 0;
    const franquiaKmFloat = franquia_km ? parseFloat(String(franquia_km)) : 0;
    const valorHoraAdcFloat = valor_hora_adc ? parseFloat(valor_hora_adc.toString().replace(/[^\d.,]/g, '').replace(',', '.')) : 0;
    const valorKmAdcFloat = valor_km_adc ? parseFloat(valor_km_adc.toString().replace(/[^\d.,]/g, '').replace(',', '.')) : 0;

    // Processar arrays de funções, regiões e veículos
    const processarFuncoes = (funcs: any[] | null | undefined) => {
      if (!funcs) return [];
      return funcs.map(f => ({
        funcao: typeof f === 'string' ? f : f.funcao || f.nome || String(f)
      }));
    };

    const processarRegioes = (regs: any[] | null | undefined) => {
      if (!regs) return [];
      return regs.map(r => ({
        regiao: typeof r === 'string' ? r : r.regiao || r.nome || String(r)
      }));
    };

    const processarVeiculos = (veics: any[] | null | undefined) => {
      if (!veics) return [];
      return veics.map(v => ({
        tipo: typeof v === 'string' ? v : v.tipo || v.nome || String(v)
      }));
    };

    // Deletar registros relacionados existentes
    console.log('Deletando registros relacionados antigos...');
    await Promise.all([
      db.funcaoPrestador.deleteMany({ where: { prestadorId: Number(id) } }),
      db.regiaoPrestador.deleteMany({ where: { prestadorId: Number(id) } }),
      db.tipoVeiculoPrestador.deleteMany({ where: { prestadorId: Number(id) } })
    ]);

    console.log('Atualizando prestador com novos dados...');
    const atualizado = await db.prestador.update({
      where: { id: Number(id) },
      data: {
        nome,
        cpf: cpf ? cpf.replace(/\D/g, '') : undefined,
        cod_nome,
        telefone,
        email,
        aprovado: aprovado || false,
        tipo_pix,
        chave_pix,
        cep,
        endereco,
        bairro,
        cidade,
        estado,
        valor_acionamento: valorAcionamentoFloat,
        franquia_horas,
        franquia_km: franquiaKmFloat,
        valor_hora_adc: valorHoraAdcFloat,
        valor_km_adc: valorKmAdcFloat,
        modelo_antena,
        funcoes: { 
          create: processarFuncoes(funcoes)
        },
        regioes: { 
          create: processarRegioes(regioes)
        },
        veiculos: {
          create: processarVeiculos(veiculos)
        }
      },
      include: { 
        funcoes: true, 
        regioes: true,
        veiculos: true
      }
    });

    // Formatar a resposta
    const prestadorFormatado = {
      ...atualizado,
      funcoes: atualizado.funcoes.map(f => f.funcao),
      regioes: atualizado.regioes.map(r => r.regiao),
      tipo_veiculo: atualizado.veiculos.map(v => v.tipo)
    };

    console.log('Prestador atualizado com sucesso:', prestadorFormatado);
    res.json(prestadorFormatado);
  } catch (err) {
    console.error('❌ Erro ao editar prestador:', err);
    res.status(500).json({ 
      erro: 'Erro ao editar prestador',
      detalhes: err instanceof Error ? err.message : String(err)
    });
  }
});

// PUT - Aprovar prestador
router.put('/:id/aprovar', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const db = await ensurePrisma();
    const prestador = await db.prestador.findUnique({
      where: { id: Number(id) }
    });

    if (!prestador) {
      return res.status(404).json({ erro: 'Prestador não encontrado' });
    }

    if (prestador.aprovado) {
      return res.status(400).json({ erro: 'Prestador já está aprovado' });
    }

    const atualizado = await db.prestador.update({
      where: { id: Number(id) },
      data: {
        aprovado: true
      }
    });

    return res.json(atualizado);
  } catch (err) {
    console.error('❌ Erro ao aprovar prestador:', err);
    return res.status(500).json({ erro: 'Erro ao aprovar prestador' });
  }
});

// DELETE - Excluir prestador
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const db = await ensurePrisma();
    // Deletar todos os registros relacionados antes de excluir o prestador
    await Promise.all([
      db.funcaoPrestador.deleteMany({ where: { prestadorId: Number(id) } }),
      db.regiaoPrestador.deleteMany({ where: { prestadorId: Number(id) } }),
      db.tipoVeiculoPrestador.deleteMany({ where: { prestadorId: Number(id) } })
    ]);

    await db.prestador.delete({ where: { id: Number(id) } });

    res.status(204).end();
  } catch (err) {
    console.error('❌ Erro ao excluir prestador:', err);
    res.status(500).json({ erro: 'Erro ao excluir prestador' });
  }
});

export default router;
