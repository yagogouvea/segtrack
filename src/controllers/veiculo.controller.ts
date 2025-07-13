import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { VeiculoService } from '../core/services/veiculo.service';

export class VeiculoController {
  private service: VeiculoService;

  constructor() {
    this.service = new VeiculoService(prisma);
  }

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const veiculos = await this.service.list();
      res.json(veiculos);
    } catch (error: unknown) {
      console.error('Erro ao listar veículos:', error);
      res.status(500).json({ error: 'Erro ao listar veículos' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const veiculo = await this.service.findById(Number(id));
      
      if (!veiculo) {
        res.status(404).json({ error: 'Veículo não encontrado' });
        return;
      }
      
      res.json(veiculo);
    } catch (error: unknown) {
      console.error('Erro ao buscar veículo:', error);
      res.status(500).json({ error: 'Erro ao buscar veículo' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const veiculo = await this.service.create(req.body);
      res.status(201).json(veiculo);
    } catch (error: unknown) {
      console.error('Erro ao criar veículo:', error);
      res.status(500).json({ error: 'Erro ao criar veículo' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const veiculo = await this.service.update(Number(id), req.body);
      
      if (!veiculo) {
        res.status(404).json({ error: 'Veículo não encontrado' });
        return;
      }
      
      res.json(veiculo);
    } catch (error: unknown) {
      console.error('Erro ao atualizar veículo:', error);
      res.status(500).json({ error: 'Erro ao atualizar veículo' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(Number(id));
      res.status(204).send();
    } catch (error: unknown) {
      console.error('Erro ao deletar veículo:', error);
      res.status(500).json({ error: 'Erro ao deletar veículo' });
    }
  };
} 