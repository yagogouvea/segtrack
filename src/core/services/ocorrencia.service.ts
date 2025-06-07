import { Prisma, Ocorrencia } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { CreateOcorrenciaDTO, UpdateOcorrenciaDTO } from '../../types/prisma';
import { ensurePrisma } from '../../lib/prisma';

type OcorrenciaStatus = 'em_andamento' | 'concluida' | 'cancelada' | 'aguardando';

interface ListOcorrenciaFilters {
  status?: OcorrenciaStatus;
  placa?: string;
  cliente?: string;
  data_inicio?: Date;
  data_fim?: Date;
}

export class OcorrenciaService {
  async list(filters: ListOcorrenciaFilters = {}): Promise<Ocorrencia[]> {
    try {
      const db = ensurePrisma();
      const where: Prisma.OcorrenciaWhereInput = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.placa) {
        where.OR = [
          { placa1: filters.placa },
          { placa2: filters.placa },
          { placa3: filters.placa }
        ];
      }

      if (filters.cliente) {
        where.cliente = {
          contains: filters.cliente
        };
      }

      if (filters.data_inicio || filters.data_fim) {
        where.criado_em = {};
        if (filters.data_inicio) {
          where.criado_em.gte = filters.data_inicio;
        }
        if (filters.data_fim) {
          where.criado_em.lte = filters.data_fim;
        }
      }

      return await db.ocorrencia.findMany({
        where,
        include: {
          fotos: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });
    } catch (error) {
      console.error('Erro ao listar ocorrências:', error);
      throw new AppError('Erro ao listar ocorrências');
    }
  }

  async create(data: CreateOcorrenciaDTO): Promise<Ocorrencia> {
    try {
      const db = ensurePrisma();
      return await db.ocorrencia.create({
        data: {
          ...data,
          status: data.status || 'em_andamento',
          criado_em: new Date(),
          atualizado_em: new Date(),
          despesas_detalhadas: data.despesas_detalhadas ?? Prisma.JsonNull
        },
        include: {
          fotos: true
        }
      });
    } catch (error) {
      console.error('Erro ao criar ocorrência:', error);
      throw new AppError('Erro ao criar ocorrência');
    }
  }

  async findById(id: number): Promise<Ocorrencia> {
    try {
      const db = ensurePrisma();
      const ocorrencia = await db.ocorrencia.findUnique({
        where: { id },
        include: {
          fotos: true
        }
      });

      if (!ocorrencia) {
        throw new AppError('Ocorrência não encontrada', 404);
      }

      return ocorrencia;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao buscar ocorrência:', error);
      throw new AppError('Erro ao buscar ocorrência');
    }
  }

  async update(id: number, data: UpdateOcorrenciaDTO): Promise<Ocorrencia> {
    try {
      const db = ensurePrisma();
      return await db.ocorrencia.update({
        where: { id },
        data: {
          ...data,
          atualizado_em: new Date(),
          despesas_detalhadas: data.despesas_detalhadas ?? Prisma.JsonNull
        },
        include: {
          fotos: true
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar ocorrência:', error);
      throw new AppError('Erro ao atualizar ocorrência');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const db = ensurePrisma();
      await db.foto.deleteMany({
        where: { ocorrenciaId: id }
      });

      await db.ocorrencia.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Erro ao deletar ocorrência:', error);
      throw new AppError('Erro ao deletar ocorrência');
    }
  }

  async findByStatus(status: OcorrenciaStatus): Promise<Ocorrencia[]> {
    try {
      const db = ensurePrisma();
      return await db.ocorrencia.findMany({
        where: { status },
        include: {
          fotos: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });
    } catch (error) {
      console.error('Erro ao buscar ocorrências por status:', error);
      throw new AppError('Erro ao buscar ocorrências por status');
    }
  }

  async findByPlaca(placa: string): Promise<Ocorrencia[]> {
    try {
      const db = ensurePrisma();
      return await db.ocorrencia.findMany({
        where: {
          OR: [
            { placa1: placa },
            { placa2: placa },
            { placa3: placa }
          ]
        },
        include: {
          fotos: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });
    } catch (error) {
      console.error('Erro ao buscar ocorrências por placa:', error);
      throw new AppError('Erro ao buscar ocorrências por placa');
    }
  }

  async addFotos(id: number, urls: string[]): Promise<Ocorrencia> {
    try {
      const db = ensurePrisma();
      return await db.ocorrencia.update({
        where: { id },
        data: {
          fotos: {
            create: urls.map(url => ({ 
              url,
              legenda: '' // Campo obrigatório
            }))
          }
        },
        include: {
          fotos: true
        }
      });
    } catch (error) {
      console.error('Erro ao adicionar fotos:', error);
      throw new AppError('Erro ao adicionar fotos');
    }
  }
} 