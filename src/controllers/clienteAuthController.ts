import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ensurePrisma } from '../lib/prisma';

// Função para normalizar CNPJ (remover pontos, traços e barras)
const normalizarCNPJ = (cnpj: string): string => {
  return cnpj.replace(/[.\-\/]/g, '');
};

// Função para validar formato do CNPJ
const validarCNPJ = (cnpj: string): boolean => {
  const cnpjLimpo = normalizarCNPJ(cnpj);
  return cnpjLimpo.length === 14;
};

export const loginCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cnpj, senha } = req.body;

    if (!cnpj || !senha) {
      res.status(400).json({ message: 'CNPJ e senha são obrigatórios' });
      return;
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está definido no ambiente');
      res.status(500).json({ message: 'Erro de configuração do servidor' });
      return;
    }

    // Normalizar CNPJ
    const cnpjNormalizado = normalizarCNPJ(cnpj);
    
    if (!validarCNPJ(cnpjNormalizado)) {
      res.status(400).json({ message: 'CNPJ inválido' });
      return;
    }

    console.log('Tentativa de login de cliente para CNPJ:', cnpjNormalizado);

    try {
      const db = await ensurePrisma();
      
      // Buscar na nova tabela de autenticação
      const clienteAuth = await db.clienteAuth.findUnique({
        where: { cnpj_normalizado: cnpjNormalizado },
        include: {
          cliente: {
            select: {
              id: true,
              nome: true,
              nome_fantasia: true,
              cnpj: true,
              cidade: true,
              estado: true
            }
          }
        }
      });

      if (!clienteAuth) {
        res.status(401).json({ message: 'Cliente não encontrado' });
        return;
      }

      if (!clienteAuth.ativo) {
        res.status(403).json({ message: 'Conta de cliente desativada' });
        return;
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, clienteAuth.senha_hash);
      
      if (!senhaValida) {
        res.status(401).json({ message: 'CNPJ ou senha incorretos' });
        return;
      }

      // Gerar token JWT para cliente
      const token = jwt.sign(
        {
          sub: clienteAuth.cliente.id.toString(),
          razaoSocial: clienteAuth.cliente.nome_fantasia || clienteAuth.cliente.nome,
          cnpj: clienteAuth.cliente.cnpj,
          tipo: 'cliente'
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('Token de cliente gerado com sucesso');

      res.json({
        token,
        cliente: {
          id: clienteAuth.cliente.id,
          razaoSocial: clienteAuth.cliente.nome_fantasia || clienteAuth.cliente.nome,
          cnpj: clienteAuth.cliente.cnpj,
          cidade: clienteAuth.cliente.cidade,
          estado: clienteAuth.cliente.estado
        }
      });

    } catch (dbError) {
      console.error('Erro ao buscar cliente:', dbError);
      res.status(500).json({ message: 'Erro ao buscar cliente' });
    }

  } catch (error: unknown) {
    console.error("Erro no login do cliente:", error);
    res.status(500).json({ message: 'Erro interno no login' });
  }
};

// Função para cadastrar novo cliente com autenticação
export const cadastrarClienteComAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      razaoSocial, 
      cnpj, 
      nomeFantasia,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cep
    } = req.body;

    if (!razaoSocial || !cnpj) {
      res.status(400).json({ message: 'Razão social e CNPJ são obrigatórios' });
      return;
    }

    // Normalizar CNPJ
    const cnpjNormalizado = normalizarCNPJ(cnpj);
    
    if (!validarCNPJ(cnpjNormalizado)) {
      res.status(400).json({ message: 'CNPJ inválido' });
      return;
    }

    console.log('Tentativa de cadastro de cliente:', { 
      razaoSocial, 
      nomeFantasia,
      cnpj: cnpjNormalizado,
      email,
      telefone,
      cidade,
      estado
    });

    try {
      const db = await ensurePrisma();
      
      // Verificar se já existe cliente com este CNPJ
      const clienteExistente = await db.cliente.findFirst({
        where: { cnpj: cnpjNormalizado }
      });

      if (clienteExistente) {
        res.status(400).json({ 
          message: 'Cliente com este CNPJ já existe',
          cliente: {
            id: clienteExistente.id,
            razaoSocial: clienteExistente.nome_fantasia || clienteExistente.nome,
            cnpj: clienteExistente.cnpj,
            cidade: clienteExistente.cidade,
            estado: clienteExistente.estado
          }
        });
        return;
      }

      // Criar novo cliente
      const novoCliente = await db.cliente.create({
        data: {
          nome: razaoSocial,
          nome_fantasia: nomeFantasia || razaoSocial,
          cnpj: cnpjNormalizado,
          email: email || null,
          telefone: telefone || null,
          endereco: endereco || null,
          cidade: cidade || null,
          estado: estado || null,
          cep: cep || null
        },
        select: {
          id: true,
          nome: true,
          nome_fantasia: true,
          cnpj: true,
          email: true,
          telefone: true,
          endereco: true,
          cidade: true,
          estado: true,
          cep: true
        }
      });

      // Criar registro de autenticação
      const senhaHash = await bcrypt.hash(cnpjNormalizado, 10);
      
      await db.clienteAuth.create({
        data: {
          cliente_id: novoCliente.id,
          cnpj_normalizado: cnpjNormalizado,
          senha_hash: senhaHash,
          ativo: true
        }
      });

      console.log('Cliente cadastrado com sucesso:', novoCliente.id);

      // Gerar credenciais de acesso
      const credenciais = {
        usuario: cnpjNormalizado,
        senha: cnpjNormalizado
      };

      res.status(201).json({
        message: 'Cliente cadastrado com sucesso',
        cliente: {
          id: novoCliente.id,
          razaoSocial: novoCliente.nome_fantasia || novoCliente.nome,
          cnpj: novoCliente.cnpj,
          email: novoCliente.email,
          telefone: novoCliente.telefone,
          endereco: novoCliente.endereco,
          cidade: novoCliente.cidade,
          estado: novoCliente.estado,
          cep: novoCliente.cep
        },
        credenciais: credenciais,
        instrucoes: {
          mensagem: 'Cliente cadastrado com sucesso!',
          acesso: 'Use o CNPJ como usuário e senha para fazer login',
          url: 'http://localhost:3000'
        }
      });

    } catch (dbError) {
      console.error('Erro ao cadastrar cliente:', dbError);
      res.status(500).json({ message: 'Erro ao cadastrar cliente' });
    }

  } catch (error: unknown) {
    console.error("Erro no cadastro do cliente:", error);
    res.status(500).json({ message: 'Erro interno no cadastro' });
  }
}; 