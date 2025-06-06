import { Request, Response } from 'express';
import { prisma } from '../../../lib/prisma';
import { OcorrenciaService } from '../../../core/services/ocorrencia.service';
import { AppError } from '../../../shared/errors/AppError';
import { UpdateOcorrenciaDTO } from '../../../types/prisma';
import { sendResponse } from '../../../utils/response';
import { Prisma } from '@prisma/client';

export class OcorrenciaController {
  private service: OcorrenciaService;

  constructor() {
    this.service = new OcorrenciaService(prisma);
  }

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { cliente, status, dataInicio, dataFim } = req.query;
      
      const filters = {
        cliente: cliente as string,
        status: status as 'em_andamento' | 'concluida' | 'cancelada' | 'aguardando',
        dataInicio: dataInicio ? new Date(dataInicio as string) : undefined,
        dataFim: dataFim ? new Date(dataFim as string) : undefined
      };

      const ocorrencias = await this.service.list(filters);
      res.json(ocorrencias);
    } catch (error) {
      console.error('Erro ao listar ocorrências:', error);
      res.status(500).json({ error: 'Erro ao listar ocorrências' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        sendResponse.badRequest(res, 'ID inválido');
        return;
      }

      const ocorrencia = await prisma.ocorrencia.findUnique({
        where: { id },
        include: { fotos: true }
      });

      if (!ocorrencia) {
        sendResponse.notFound(res, 'Ocorrência não encontrada');
        return;
      }

      sendResponse.ok(res, ocorrencia);
    } catch (error) {
      sendResponse.error(res, error);
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const ocorrencia = await this.service.create(req.body);
      res.status(201).json(ocorrencia);
    } catch (error) {
      console.error('Erro ao criar ocorrência:', error);
      res.status(500).json({ error: 'Erro ao criar ocorrência' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        sendResponse.badRequest(res, 'ID inválido');
        return;
      }

      const data = req.body as UpdateOcorrenciaDTO;

      const ocorrencia = await prisma.ocorrencia.update({
        where: { id },
        data: {
          ...data,
          status: data.status ?? 'em_andamento',
          despesas_detalhadas: data.despesas_detalhadas ?? Prisma.JsonNull,
          fotos: data.fotos ? {
            create: data.fotos.map(foto => ({
              url: foto.url,
              legenda: foto.legenda || ''
            }))
          } : undefined
        },
        include: { fotos: true }
      });

      sendResponse.ok(res, ocorrencia);
    } catch (error) {
      sendResponse.error(res, error);
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        sendResponse.badRequest(res, 'ID inválido');
        return;
      }

      await prisma.ocorrencia.delete({
        where: { id }
      });

      sendResponse.noContent(res);
    } catch (error) {
      sendResponse.error(res, error);
    }
  };

  addPhotos = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        sendResponse.badRequest(res, 'ID inválido');
        return;
      }

      const { urls } = req.body;
      if (!Array.isArray(urls)) {
        sendResponse.badRequest(res, 'URLs inválidas');
        return;
      }

      const ocorrencia = await prisma.ocorrencia.update({
        where: { id },
        data: {
          fotos: {
            create: urls.map(url => ({
              url,
              legenda: ''
            }))
          }
        },
        include: { fotos: true }
      });

      sendResponse.ok(res, ocorrencia);
    } catch (error) {
      sendResponse.error(res, error);
    }
  };

  generateReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const report = await this.service.generateReport(Number(id));
      res.json(report);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
} 