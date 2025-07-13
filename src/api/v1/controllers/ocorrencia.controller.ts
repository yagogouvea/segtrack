import { Request, Response } from 'express';
import { OcorrenciaService } from '@/core/services/ocorrencia.service';
import { AppError } from '@/shared/errors/AppError';
import { UpdateOcorrenciaDTO, OcorrenciaStatus } from '../../../types/prisma';
import { sendResponse } from '../../../utils/response';
import { Prisma } from '@prisma/client';

export class OcorrenciaController {
  private service: OcorrenciaService;

  constructor() {
    this.service = new OcorrenciaService();
  }

  async list(req: Request, res: Response) {
    try {
      const { status, placa, cliente, data_inicio, data_fim } = req.query;

      const filters = {
        status: status as OcorrenciaStatus,
        placa: placa as string,
        cliente: cliente as string,
        data_inicio: data_inicio ? new Date(data_inicio as string) : undefined,
        data_fim: data_fim ? new Date(data_fim as string) : undefined
      };

      const ocorrencias = await this.service.list(filters);
      return res.json(ocorrencias);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const ocorrencia = await this.service.create(req.body);
      return res.status(201).json(ocorrencia);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ocorrencia = await this.service.findById(Number(id));
      return res.json(ocorrencia);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log('[OcorrenciaController] Update request for ID:', id);
      console.log('[OcorrenciaController] Request body:', JSON.stringify(req.body, null, 2));
      
      const ocorrencia = await this.service.update(Number(id), req.body);
      return res.json(ocorrencia);
    } catch (error: unknown) {
      console.error('[OcorrenciaController] Error in update:', error);
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.service.delete(Number(id));
      return res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async findByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const ocorrencias = await this.service.findByStatus(status as OcorrenciaStatus);
      return res.json(ocorrencias);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async findByPlaca(req: Request, res: Response) {
    try {
      const { placa } = req.params;
      const ocorrencias = await this.service.findByPlaca(placa);
      return res.json(ocorrencias);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async addFotos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { urls } = req.body;

      if (!Array.isArray(urls)) {
        return res.status(400).json({ error: 'URLs devem ser um array' });
      }

      const ocorrencia = await this.service.addFotos(Number(id), urls);
      return res.json(ocorrencia);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 