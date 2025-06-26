import { Request, Response } from 'express';
import { OcorrenciaService } from '../core/services/ocorrencia.service';
import { AppError } from '../shared/errors/AppError';
import { OcorrenciaStatus } from '../types/prisma';

export class OcorrenciaController {
  private service: OcorrenciaService;

  constructor() {
    this.service = new OcorrenciaService();
  }

  async list(req: Request, res: Response) {
    try {
      console.log('[OcorrenciaController] Iniciando listagem de ocorrências');
      console.log('[OcorrenciaController] Query params:', req.query);
      console.log('[OcorrenciaController] User:', req.user);

      const { status, placa, cliente, data_inicio, data_fim } = req.query;

      const filters = {
        status: status as OcorrenciaStatus,
        placa: placa as string,
        cliente: cliente as string,
        data_inicio: data_inicio ? new Date(data_inicio as string) : undefined,
        data_fim: data_fim ? new Date(data_fim as string) : undefined
      };

      console.log('[OcorrenciaController] Filtros aplicados:', filters);

      const ocorrencias = await this.service.list(filters);
      console.log('[OcorrenciaController] Ocorrências encontradas:', ocorrencias.length);
      
      return res.json(ocorrencias);
    } catch (error) {
      console.error('[OcorrenciaController] Erro ao listar ocorrências:', {
        error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ 
          error: error.message,
          code: error.code,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }

      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const ocorrencia = await this.service.create(req.body);
      return res.status(201).json(ocorrencia);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ocorrencia = await this.service.findById(Number(id));
      return res.json(ocorrencia);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ocorrencia = await this.service.update(Number(id), req.body);
      return res.json(ocorrencia);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.service.delete(Number(id));
      return res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async findByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const ocorrencias = await this.service.findByStatus(status as OcorrenciaStatus);
      return res.json(ocorrencias);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async findByPlaca(req: Request, res: Response) {
    try {
      const { placa } = req.params;
      const ocorrencias = await this.service.findByPlaca(placa);
      return res.json(ocorrencias);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async addFotos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        throw new AppError('Nenhuma foto foi enviada', 400);
      }

      const urls = files.map(file => file.path);
      const ocorrencia = await this.service.addFotos(Number(id), urls);
      return res.json(ocorrencia);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 