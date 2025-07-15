import { PrismaClient } from '@prisma/client';

interface ClienteData {
  nome: string;
  cnpj: string;
  contato?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  nome_fantasia?: string;
  logo?: string;
  camposAdicionais?: Array<{
    label: string;
    campo: string;
  }>;
}

// Função para normalizar CNPJ (remover pontos, traços e barras)
const normalizarCNPJ = (cnpj: string): string => {
  return cnpj.replace(/[.\-\/]/g, '');
};

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

  async create(data: ClienteData & { contratos?: any[] }) {
    // Normalizar CNPJ antes de salvar
    const cnpjNormalizado = normalizarCNPJ(data.cnpj);
    
    return this.prisma.cliente.create({
      data: {
        nome: data.nome,
        cnpj: cnpjNormalizado, // Salvar CNPJ normalizado
        contato: data.contato,
        telefone: data.telefone,
        email: data.email,
        endereco: data.endereco,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
        nome_fantasia: data.nome_fantasia,
        logo: data.logo,
        camposAdicionais: {
          create: data.camposAdicionais
        },
        contratos: data.contratos && data.contratos.length > 0
          ? { create: data.contratos }
          : undefined
      },
      include: {
        camposAdicionais: true,
        contratos: true
      }
    });
  }

  async update(id: number, data: Partial<ClienteData> & { contratos?: any[] }) {
    // Deletar contratos antigos se vierem novos
    if (data.contratos) {
      await this.prisma.contrato.deleteMany({ where: { clienteId: id } });
    }
    // Deletar campos adicionais antigos se vierem novos
    if (data.camposAdicionais) {
      await this.prisma.campoAdicionalCliente.deleteMany({ where: { clienteId: id } });
    }

    // Preparar dados para atualização
    const updateData: any = {
      nome: data.nome,
      contato: data.contato,
      telefone: data.telefone,
      email: data.email,
      endereco: data.endereco,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
      cep: data.cep,
      nome_fantasia: data.nome_fantasia,
      logo: data.logo,
      camposAdicionais: data.camposAdicionais ? { create: data.camposAdicionais } : undefined,
      contratos: data.contratos && data.contratos.length > 0
        ? { create: data.contratos }
        : undefined
    };

    // Normalizar CNPJ se fornecido
    if (data.cnpj) {
      updateData.cnpj = normalizarCNPJ(data.cnpj);
    }

    return this.prisma.cliente.update({
      where: { id },
      data: updateData,
      include: {
        camposAdicionais: true,
        contratos: true
      }
    });
  }

  async delete(id: number) {
    // Primeiro deletamos os contratos
    await this.prisma.contrato.deleteMany({
      where: { clienteId: id }
    });

    // Depois deletamos os campos adicionais
    await this.prisma.campoAdicionalCliente.deleteMany({
      where: { clienteId: id }
    });

    // Por último deletamos o cliente
    return this.prisma.cliente.delete({
      where: { id }
    });
  }
} 