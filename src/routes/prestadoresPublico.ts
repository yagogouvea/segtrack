import express, { Request, Response } from 'express';
import { ensurePrisma } from '../lib/prisma';
import { PrestadorPublicoInput } from '../types/prestadorPublico';

const router = express.Router();

// Cadastro público de prestadores
router.post('/', async (req: Request<{}, {}, PrestadorPublicoInput>, res: Response): Promise<void> => {
  console.log('Recebendo requisição de cadastro público:', req.body);
  
  const {
    nome, cpf, cod_nome, telefone, email,
    tipo_pix, chave_pix, cep, endereco, bairro, cidade, estado,
    funcoes, regioes, tipo_veiculo
  } = req.body;

  // Validação de campos obrigatórios
  if (
    !nome || !cpf || !cod_nome || !telefone || !email ||
    !tipo_pix || !chave_pix || !cep ||
    !funcoes?.length || !regioes?.length || !tipo_veiculo?.length
  ) {
    console.log('Campos obrigatórios faltando:', {
      temNome: !!nome,
      temCPF: !!cpf,
      temCodNome: !!cod_nome,
      temTelefone: !!telefone,
      temEmail: !!email,
      temTipoPix: !!tipo_pix,
      temChavePix: !!chave_pix,
      temCEP: !!cep,
      temFuncoes: !!funcoes?.length,
      temRegioes: !!regioes?.length,
      temTipoVeiculo: !!tipo_veiculo?.length
    });
    res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    return;
  }

  try {
    const db = ensurePrisma();
    // Verificar se já existe um prestador com este CPF
    const existente = await db.prestador.findFirst({
      where: { cpf: cpf.replace(/\D/g, '') }
    });

    if (existente) {
      res.status(400).json({ error: 'Já existe um prestador cadastrado com este CPF.' });
      return;
    }

    console.log('Criando prestador com os dados:', {
      nome, cpf, cod_nome, telefone, email,
      tipo_pix, chave_pix, cep,
      qtdFuncoes: funcoes.length,
      qtdRegioes: regioes.length,
      qtdVeiculos: tipo_veiculo.length,
      veiculos: tipo_veiculo.map((tipo: string) => ({ tipo }))
    });

    // Garantir que tipo_veiculo é um array
    const veiculosParaCriar = Array.isArray(tipo_veiculo) ? 
        tipo_veiculo.map((tipo: string) => ({ tipo })) : [];

    const novoPrestador = await db.prestador.create({
      data: {
        nome,
        cpf: cpf.replace(/\D/g, ''),
        cod_nome,
        telefone,
        email,
        tipo_pix,
        chave_pix,
        cep,
        endereco,
        bairro,
        cidade,
        estado,
        origem: 'cadastro_publico',
        aprovado: false,
        valor_acionamento: 0,
        valor_hora_adc: 0,
        valor_km_adc: 0,
        franquia_km: 0,
        franquia_horas: '',
        funcoes: {
          create: funcoes.map((funcao: string) => ({ funcao }))
        },
        regioes: {
          create: regioes.map((regiao: string) => ({ regiao }))
        },
        veiculos: {
          create: veiculosParaCriar
        }
      },
      include: {
        funcoes: true,
        regioes: true,
        veiculos: true
      }
    });

    // Formatar a resposta para incluir tipo_veiculo
    const prestadorFormatado = {
      ...novoPrestador,
      funcoes: novoPrestador.funcoes.map((f: { funcao: string }) => f.funcao),
      regioes: novoPrestador.regioes.map((r: { regiao: string }) => r.regiao),
      tipo_veiculo: novoPrestador.veiculos.map((v: { tipo: string }) => v.tipo),
      veiculos: novoPrestador.veiculos
    };

    console.log('Prestador criado com sucesso:', prestadorFormatado);
    res.status(201).json(prestadorFormatado);
  } catch (error) {
    console.error('Erro ao cadastrar prestador público:', error);
    res.status(500).json({ 
      error: 'Erro ao processar o cadastro.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Listar prestadores públicos
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = ensurePrisma();
    const prestadores = await db.prestador.findMany({
      where: { aprovado: true },
      select: {
        id: true,
        nome: true,
        cidade: true,
        estado: true,
        funcoes: {
          select: {
            funcao: true
          }
        }
      }
    });

    // Transform the response to include functions in a flattened format
    const formattedPrestadores = prestadores.map((p: any) => ({
      ...p,
      funcoes: p.funcoes.map((f: { funcao: string }) => f.funcao)
    }));

    res.json(formattedPrestadores);
  } catch (error) {
    console.error('Erro ao buscar prestadores:', error);
    res.status(500).json({ error: 'Erro ao buscar prestadores' });
  }
});

// Buscar prestador público por ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const db = ensurePrisma();
    const prestador = await db.prestador.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nome: true,
        cidade: true,
        estado: true,
        funcoes: {
          select: {
            funcao: true
          }
        },
        aprovado: true
      }
    });

    if (!prestador) {
      res.status(404).json({ error: 'Prestador não encontrado' });
      return;
    }

    // Transform the response to include functions in a flattened format
    const formattedPrestador = {
      ...prestador,
      funcoes: prestador.funcoes.map((f: { funcao: string }) => f.funcao)
    };

    res.json(formattedPrestador);
  } catch (error) {
    console.error('Erro ao buscar prestador:', error);
    res.status(500).json({ error: 'Erro ao buscar prestador' });
  }
});

export default router;
