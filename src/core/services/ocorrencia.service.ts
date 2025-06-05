import { PrismaClient, Ocorrencia } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { CreateOcorrenciaDTO, UpdateOcorrenciaDTO } from '../types/ocorrencia.types';

export class OcorrenciaService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll(): Promise<Ocorrencia[]> {
    return this.prisma.ocorrencia.findMany({
      include: {
        fotos: true
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
      throw new AppError('Ocorrência não encontrada', 404);
    }

    return ocorrencia;
  }

  async create(data: CreateOcorrenciaDTO): Promise<Ocorrencia> {
    return this.prisma.ocorrencia.create({
      data,
      include: {
        fotos: true
      }
    });
  }

  async update(id: number, data: UpdateOcorrenciaDTO): Promise<Ocorrencia> {
    const ocorrencia = await this.prisma.ocorrencia.findUnique({
      where: { id }
    });

    if (!ocorrencia) {
      throw new AppError('Ocorrência não encontrada', 404);
    }

    return this.prisma.ocorrencia.update({
      where: { id },
      data,
      include: {
        fotos: true
      }
    });
  }

  async delete(id: number): Promise<void> {
    const ocorrencia = await this.prisma.ocorrencia.findUnique({
      where: { id }
    });

    if (!ocorrencia) {
      throw new AppError('Ocorrência não encontrada', 404);
    }

    await this.prisma.ocorrencia.delete({
      where: { id }
    });
  }

  async findByStatus(status: string): Promise<Ocorrencia[]> {
    return this.prisma.ocorrencia.findMany({
      where: { status },
      include: {
        fotos: true
      }
    });
  }

  async addPhotos(id: number, fotos: { url: string; legenda: string }[]): Promise<Ocorrencia> {
    const ocorrencia = await this.prisma.ocorrencia.findUnique({
      where: { id }
    });

    if (!ocorrencia) {
      throw new AppError('Ocorrência não encontrada', 404);
    }

    await this.prisma.foto.createMany({
      data: fotos.map(foto => ({
        ...foto,
        ocorrenciaId: id
      }))
    });

    return this.findById(id);
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
} 