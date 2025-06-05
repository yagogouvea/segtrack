import { Request, Response } from 'express';
import { OcorrenciaService } from '../../../core/services/ocorrencia.service';
import { AppError } from '../../../shared/errors/AppError';

export class OcorrenciaController {
  private service: OcorrenciaService;

  constructor() {
    this.service = new OcorrenciaService();
  }

  list = async (req: Request, res: Response) => {
    try {
      const ocorrencias = await this.service.findAll();
      return res.json(ocorrencias);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  getById = async (req: Request, res: Response) => {
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
  };

  create = async (req: Request, res: Response) => {
    try {
      const ocorrencia = await this.service.create(req.body);
      return res.status(201).json(ocorrencia);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  update = async (req: Request, res: Response) => {
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
  };

  delete = async (req: Request, res: Response) => {
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
  };

  listByStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      const ocorrencias = await this.service.findByStatus(status);
      return res.json(ocorrencias);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  addPhotos = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { fotos } = req.body;
      const ocorrencia = await this.service.addPhotos(Number(id), fotos);
      return res.json(ocorrencia);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  generateReport = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const report = await this.service.generateReport(Number(id));
      return res.json(report);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
} 