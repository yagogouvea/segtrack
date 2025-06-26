import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ClienteService } from '../core/services/cliente.service';

export class ClienteController {
  private service: ClienteService;

  constructor() {
    this.service = new ClienteService(prisma);
  }

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Em desenvolvimento, retornar dados mock
      // if (process.env.NODE_ENV === 'development') {
      //   console.log('[ClienteController] Modo desenvolvimento: retornando dados mock');
      //   res.json(mockClientes);
      //   return;
      // }

      const clientes = await this.service.list();
      res.json(clientes);
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({ error: 'Erro ao listar clientes' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }
      
      const cliente = await this.service.findById(id);
      
      if (!cliente) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }
      
      res.json(cliente);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const cliente = await this.service.create(req.body);
      res.status(201).json(cliente);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({ error: 'Erro ao criar cliente' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const cliente = await this.service.update(id, req.body);
      
      if (!cliente) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }
      
      res.json(cliente);
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      await this.service.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
  };
} 