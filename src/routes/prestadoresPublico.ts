import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PrestadorPublicoInput } from '../types/prestadorPublico';

const router = express.Router();
const prisma = new PrismaClient();

// Cadastro público de prestadores
router.post('/', async (req: Request<{}, {}, PrestadorPublicoInput>, res: Response) => {
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
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  try {
    console.log('Criando prestador com os dados:', {
      nome, cpf, cod_nome, telefone, email,
      tipo_pix, chave_pix, cep,
      qtdFuncoes: funcoes.length,
      qtdRegioes: regioes.length,
      qtdVeiculos: tipo_veiculo.length
    });

    const novoPrestador = await prisma.prestador.create({
      data: {
        nome,
        cpf,
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
          create: funcoes.map((funcao) => ({ funcao }))
        },
        regioes: {
          create: regioes.map((regiao) => ({ regiao }))
        },
        veiculos: {
          create: tipo_veiculo.map((tipo) => ({ tipo }))
        }
      },
      include: {
        funcoes: true,
        regioes: true,
        veiculos: true
      }
    });

    console.log('Prestador criado com sucesso:', novoPrestador);
    res.status(201).json(novoPrestador);
  } catch (error) {
    console.error('Erro ao cadastrar prestador público:', error);
    res.status(500).json({ 
      error: 'Erro ao processar o cadastro.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
