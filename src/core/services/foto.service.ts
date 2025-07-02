import { PrismaClient } from '@prisma/client';

interface FotoUploadData {
  url: string;
  legenda: string;
  ocorrenciaId: number;
}

export class FotoService {
  constructor(private prisma: PrismaClient) {}

  async list() {
    return this.prisma.foto.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: number) {
    return this.prisma.foto.findUnique({
      where: { id }
    });
  }

  async findByOcorrencia(ocorrenciaId: number) {
    return this.prisma.foto.findMany({
      where: { ocorrenciaId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async upload(data: FotoUploadData) {
    return this.prisma.foto.create({
      data: {
        url: data.url,
        legenda: data.legenda,
        ocorrenciaId: data.ocorrenciaId
      }
    });
  }

  async delete(id: number) {
    return this.prisma.foto.delete({
      where: { id }
    });
  }

  async update(id: number, data: any) {
    return this.prisma.foto.update({
      where: { id },
      data
    });
  }
} 