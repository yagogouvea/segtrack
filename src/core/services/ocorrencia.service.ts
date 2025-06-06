import { PrismaClient, Prisma, Ocorrencia } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { CreateOcorrenciaDTO, UpdateOcorrenciaDTO } from '../../types/prisma';

type OcorrenciaStatus = 'em_andamento' | 'concluida' | 'cancelada' | 'aguardando';

interface ListOcorrenciaFilters {
  cliente?: string;
  status?: OcorrenciaStatus;
  dataInicio?: Date;
  dataFim?: Date;
}

export class OcorrenciaService {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<Ocorrencia[]> {
    return this.prisma.ocorrencia.findMany({
      include: {
        fotos: true
      },
      orderBy: {
        criado_em: 'desc'
      }
    });
  }

  async findById(id: number): Promise<Ocorrencia | null> {
    const ocorrencia = await this.prisma.ocorrencia.findUnique({
      where: { id },
      include: {
        fotos: true
      }
    });

    if (!ocorrencia) {
      return null;
    }

    return ocorrencia;
  }

  async create(data: CreateOcorrenciaDTO): Promise<Ocorrencia> {
    return this.prisma.ocorrencia.create({
      data: {
        ...data,
        status: data.status || 'em_andamento',
        despesas_detalhadas: data.despesas_detalhadas ?? Prisma.JsonNull,
        fotos: data.fotos ? {
          create: data.fotos.map(foto => ({
            url: foto.url,
            legenda: foto.legenda || ''
          }))
        } : undefined
      },
      include: {
        fotos: true
      }
    });
  }

  async update(id: number, data: UpdateOcorrenciaDTO): Promise<Ocorrencia> {
    return this.prisma.ocorrencia.update({
      where: { id },
      data: {
        ...data,
        status: data.status,
        despesas_detalhadas: data.despesas_detalhadas ?? Prisma.JsonNull,
        fotos: data.fotos ? {
          create: data.fotos.map(foto => ({
            url: foto.url,
            legenda: foto.legenda || ''
          }))
        } : undefined
      },
      include: {
        fotos: true
      }
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.foto.deleteMany({
      where: { ocorrenciaId: id }
    });

    await this.prisma.ocorrencia.delete({
      where: { id }
    });
  }

  async findByStatus(status: OcorrenciaStatus): Promise<Ocorrencia[]> {
    return this.prisma.ocorrencia.findMany({
      where: { status },
      include: {
        fotos: true
      },
      orderBy: {
        criado_em: 'desc'
      }
    });
  }

  async addPhotos(id: number, fotos: { url: string; legenda: string }[]): Promise<Ocorrencia> {
    return this.prisma.ocorrencia.update({
      where: { id },
      data: {
        fotos: {
          create: fotos
        }
      },
      include: {
        fotos: true
      }
    });
  }

  async generateReport(id: number): Promise<{ url: string }> {
    const ocorrencia = await this.findById(id);

    if (!ocorrencia) {
      throw new AppError('Ocorrência não encontrada', 404);
    }

    // Implementar geração de relatório
    // TODO: Integrar com serviço de geração de PDF

    return {
      url: `/relatorios/${id}.pdf`
    };
  }

  async list(filters: ListOcorrenciaFilters = {}): Promise<Ocorrencia[]> {
    const where: Prisma.OcorrenciaWhereInput = {};

    if (filters.cliente) {
      where.cliente = filters.cliente;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dataInicio || filters.dataFim) {
      where.criado_em = {
        gte: filters.dataInicio,
        lte: filters.dataFim
      };
    }

    return this.prisma.ocorrencia.findMany({
      where,
      include: {
        fotos: true
      },
      orderBy: {
        criado_em: 'desc'
      }
    });
  }

  async getById(id: number): Promise<Ocorrencia | null> {
    return this.prisma.ocorrencia.findUnique({
      where: { id },
      include: {
        fotos: true
      }
    });
  }

  async addFotos(id: number, urls: string[]): Promise<Ocorrencia> {
    return this.prisma.ocorrencia.update({
      where: { id },
      data: {
        fotos: {
          create: urls.map(url => ({
            url,
            legenda: ''
          }))
        }
      },
      include: {
        fotos: true
      }
    });
  }
} 