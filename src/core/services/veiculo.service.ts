import { PrismaClient } from '@prisma/client';

interface VeiculoData {
  placa: string;
  modelo?: string;
  marca?: string;
  cor?: string;
  fabricante?: string;
  ano?: number;
}

export class VeiculoService {
  constructor(private prisma: PrismaClient) {}

  async list() {
    return this.prisma.veiculo.findMany({
      orderBy: { placa: 'asc' }
    });
  }

  async findById(id: number) {
    return this.prisma.veiculo.findUnique({
      where: { id }
    });
  }

  async create(data: VeiculoData) {
    return this.prisma.veiculo.create({
      data
    });
  }

  async update(id: number, data: Partial<VeiculoData>) {
    return this.prisma.veiculo.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return this.prisma.veiculo.delete({
      where: { id }
    });
  }
} 