import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { OcorrenciaStatus } from '../types/prisma';

const prisma = new PrismaClient();

export class OcorrenciaController {
  async list(req: Request, res: Response) {
    try {
      const { cliente, status, dataInicio, dataFim } = req.query;
      
      const filters = {
        cliente: cliente as string,
        status: status as OcorrenciaStatus,
        dataInicio: dataInicio ? new Date(dataInicio as string) : undefined,
        dataFim: dataFim ? new Date(dataFim as string) : undefined
      };

      const ocorrencias = await prisma.ocorrencia.findMany({
        where: {
          ...(filters.cliente && { cliente: filters.cliente }),
          ...(filters.status && { status: filters.status }),
          ...(filters.dataInicio || filters.dataFim) && {
            criado_em: {
              gte: filters.dataInicio,
              lte: filters.dataFim
            }
          }
        },
        include: {
          fotos: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });

      res.json(ocorrencias);
    } catch (error) {
      console.error('Erro ao listar ocorrências:', error);
      res.status(500).json({ error: 'Erro ao listar ocorrências' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const data = req.body;

      const ocorrencia = await prisma.ocorrencia.create({
        data: {
          ...data,
          status: data.status as OcorrenciaStatus,
          despesas_detalhadas: data.despesas_detalhadas ? 
            data.despesas_detalhadas as Prisma.InputJsonValue : 
            Prisma.NullTypes.JsonNull
        },
        include: {
          fotos: true
        }
      });

      return res.status(201).json(ocorrencia);
    } catch (error) {
      console.error('Erro ao criar ocorrência:', error);
      return res.status(500).json({ error: 'Erro ao criar ocorrência' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const ocorrencia = await prisma.ocorrencia.update({
        where: { id: Number(id) },
        data: {
          ...data,
          status: data.status as OcorrenciaStatus,
          despesas_detalhadas: data.despesas_detalhadas ? 
            data.despesas_detalhadas as Prisma.InputJsonValue : 
            Prisma.NullTypes.JsonNull
        },
        include: {
          fotos: true
        }
      });

      return res.json(ocorrencia);
    } catch (error) {
      console.error('Erro ao atualizar ocorrência:', error);
      return res.status(500).json({ error: 'Erro ao atualizar ocorrência' });
    }
  }

  // ... rest of the methods ...
} 