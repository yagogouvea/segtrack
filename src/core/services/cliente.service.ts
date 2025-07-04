import { PrismaClient } from '@prisma/client';

interface ClienteData {
  nome: string;
  cnpj: string;
  contato?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  logo?: string;
  camposAdicionais?: Array<{
    label: string;
    campo: string;
  }>;
}

export class ClienteService {
  constructor(private prisma: PrismaClient) {}

  async list() {
    return this.prisma.cliente.findMany({
      orderBy: { nome: 'asc' },
      include: {
        camposAdicionais: true,
        contratos: true
      }
    });
  }

  async findById(id: number) {
    return this.prisma.cliente.findUnique({
      where: { id },
      include: {
        camposAdicionais: true,
        contratos: true
      }
    });
  }

  async create(data: ClienteData) {
    return this.prisma.cliente.create({
      data: {
        nome: data.nome,
        cnpj: data.cnpj,
        contato: data.contato,
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        logo: data.logo,
        camposAdicionais: {
          create: data.camposAdicionais
        }
      },
      include: {
        camposAdicionais: true,
        contratos: true
      }
    });
  }

  async update(id: number, data: Partial<ClienteData>) {
    // Se houver campos adicionais, primeiro deletamos os existentes
    if (data.camposAdicionais) {
      await this.prisma.campoAdicionalCliente.deleteMany({
        where: { clienteId: id }
      });
    }

    return this.prisma.cliente.update({
      where: { id },
      data: {
        nome: data.nome,
        cnpj: data.cnpj,
        contato: data.contato,
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        logo: data.logo,
        camposAdicionais: data.camposAdicionais ? {
          create: data.camposAdicionais
        } : undefined
      },
      include: {
        camposAdicionais: true,
        contratos: true
      }
    });
  }

  async delete(id: number) {
    // Primeiro deletamos os campos adicionais
    await this.prisma.campoAdicionalCliente.deleteMany({
      where: { clienteId: id }
    });

    // Depois deletamos o cliente
    return this.prisma.cliente.delete({
      where: { id }
    });
  }
} 