import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ensurePrisma } from '../lib/prisma';

interface PrismaUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  permissions: string;
  active: boolean;
}

// Função para normalizar CNPJ (remover pontos, traços e barras)
const normalizarCNPJ = (cnpj: string): string => {
  return cnpj.replace(/[.\-\/]/g, '');
};

// Função para validar formato do CNPJ
const validarCNPJ = (cnpj: string): boolean => {
  const cnpjLimpo = normalizarCNPJ(cnpj);
  return cnpjLimpo.length === 14;
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar corpo da requisição
    const { email, password, senha } = req.body;
    const userPassword = password || senha;
    if (!email || !userPassword) {
      res.status(400).json({ message: 'Email e password são obrigatórios' });
      return;
    }

    // Validar JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está definido no ambiente');
      res.status(500).json({ message: 'Erro de configuração do servidor' });
      return;
    }

    console.log('Tentativa de login para:', email);

    try {
      const db = await ensurePrisma();
      const user = await db.user.findUnique({ 
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          passwordHash: true,
          role: true,
          permissions: true,
          active: true
        }
      }) as PrismaUser | null;

      console.log('Resultado da busca do usuário:', {
        found: !!user,
        role: user?.role,
        active: user?.active
      });

      if (!user) {
        res.status(401).json({ message: 'Usuário não encontrado' });
        return;
      }

      if (!user.active) {
        res.status(403).json({ message: 'Usuário desativado. Entre em contato com o administrador.' });
        return;
      }

      const isMatch = await bcrypt.compare(userPassword, user.passwordHash);
      console.log('Resultado da verificação de senha:', { isMatch });

      if (!isMatch) {
        res.status(401).json({ message: 'Senha incorreta' });
        return;
      }

      try {
        let permissions: string[];
        try {
          if (Array.isArray(user.permissions)) {
            permissions = user.permissions;
          } else if (typeof user.permissions === 'string') {
            permissions = JSON.parse(user.permissions);
          } else {
            throw new Error('Formato de permissões inválido');
          }
          if (!Array.isArray(permissions)) {
            throw new Error('Formato de permissões inválido');
          }
        } catch (parseError) {
          console.error('Erro ao converter permissões:', parseError);
          res.status(500).json({ message: 'Erro ao processar permissões do usuário' });
          return;
        }
        
        console.log('Permissões do usuário:', permissions);

        const token = jwt.sign(
          {
            sub: user.id,
            nome: user.name,
            email: user.email,
            role: user.role,
            permissions: permissions
          },
          process.env.JWT_SECRET,
          { expiresIn: '12h' }
        );

        console.log('Token gerado com sucesso');

        res.json({ 
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: permissions
          }
        });
      } catch (conversionError) {
        console.error('Erro na conversão de permissões:', conversionError);
        res.status(500).json({ message: 'Erro ao processar permissões' });
      }
    } catch (dbError) {
      console.error('Erro ao buscar usuário:', dbError);
      res.status(500).json({ message: 'Erro ao buscar usuário' });
    }
  } catch (error: unknown) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: 'Erro interno no login' });
  }
};

// Nova função para login de clientes via CNPJ
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
      const cliente = await db.cliente.findFirst({
        where: { cnpj: cnpjNormalizado },
        select: {
          id: true,
          nome: true,
          nome_fantasia: true,
          cnpj: true,
          cidade: true,
          estado: true
        }
      });

      if (!cliente) {
        res.status(401).json({ message: 'Cliente não encontrado' });
        return;
      }

      // Verificar se a senha é igual ao CNPJ normalizado (por padrão)
      if (senha !== cnpjNormalizado) {
        res.status(401).json({ message: 'CNPJ ou senha incorretos' });
        return;
      }

      // Gerar token JWT para cliente
      const token = jwt.sign(
        {
          sub: cliente.id.toString(),
          razaoSocial: cliente.nome_fantasia || cliente.nome,
          cnpj: cliente.cnpj,
          tipo: 'cliente'
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('Token de cliente gerado com sucesso');

      res.json({
        token,
        cliente: {
          id: cliente.id,
          razaoSocial: cliente.nome_fantasia || cliente.nome,
          cnpj: cliente.cnpj,
          cidade: cliente.cidade,
          estado: cliente.estado
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

// Nova função para cadastro de clientes
export const cadastrarCliente = async (req: Request, res: Response): Promise<void> => {
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

export const seedAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = await ensurePrisma();
    const existing = await db.user.findUnique({
      where: { email: 'admin@segtrack.com' },
    });

    if (existing) {
      res.status(400).json({ message: 'Usuário já existe' });
      return;
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    const permissions = [
      'create:user',
      'read:user',
      'update:user',
      'delete:user',
      'create:ocorrencia',
      'read:ocorrencia',
      'update:ocorrencia',
      'delete:ocorrencia',
      'read:dashboard',
      'read:relatorio',
      'create:foto',
      'read:foto',
      'update:foto',
      'delete:foto',
      'upload:foto'
    ];

    const user = await db.user.create({
      data: {
        name: 'Admin SEGTRACK',
        email: 'admin@segtrack.com',
        passwordHash: hashedPassword,
        role: 'admin',
        permissions: JSON.stringify(permissions),
        active: true,
      },
    });

    res.json({ message: 'Usuário admin criado com sucesso', id: user.id });
  } catch (error: unknown) {
    console.error("Erro ao criar admin:", error);
    res.status(500).json({ message: 'Erro ao criar admin', error });
  }
};

// Função para login de prestadores
export const loginPrestador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      res.status(400).json({ message: 'Email e senha são obrigatórios' });
      return;
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está definido no ambiente');
      res.status(500).json({ message: 'Erro de configuração do servidor' });
      return;
    }

    console.log('Tentativa de login de prestador para:', email);

    try {
      const db = await ensurePrisma();
      
      // Buscar usuário prestador
      const usuarioPrestador = await db.usuarioPrestador.findFirst({
        where: { email },
        include: {
          prestador: true
        }
      });

      if (!usuarioPrestador) {
        console.log('Prestador não encontrado:', email);
        res.status(401).json({ message: 'Prestador não encontrado' });
        return;
      }

      // Verificar se o usuário está ativo
      if (!usuarioPrestador.ativo) {
        console.log('Prestador inativo:', email);
        res.status(401).json({ message: 'Usuário não encontrado ou inativo.' });
        return;
      }

      // NOVA VERIFICAÇÃO: Usar senha_hash e bcrypt
      const bcrypt = require('bcryptjs');
      const senhaCorreta = await bcrypt.compare(senha, usuarioPrestador.senha_hash);
      if (!senhaCorreta) {
        console.log('Senha incorreta para prestador:', email);
        res.status(401).json({ message: 'Senha inválida.' });
        return;
      }

      // Gerar token JWT para prestador
      const token = jwt.sign(
        {
          sub: usuarioPrestador.id,
          nome: usuarioPrestador.prestador.nome,
          email: usuarioPrestador.email,
          tipo: 'prestador',
          prestador_id: usuarioPrestador.prestador_id
        },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      console.log('Login de prestador bem-sucedido:', email);

      res.json({ 
        token,
        prestador: {
          id: usuarioPrestador.prestador_id,
          nome: usuarioPrestador.prestador.nome,
          email: usuarioPrestador.email,
          telefone: usuarioPrestador.prestador.telefone
        }
      });
    } catch (dbError) {
      console.error('Erro ao buscar prestador:', dbError);
      res.status(500).json({ message: 'Erro ao buscar prestador' });
    }
  } catch (error: unknown) {
    console.error("Erro no login de prestador:", error);
    res.status(500).json({ message: 'Erro interno no login' });
  }
};
