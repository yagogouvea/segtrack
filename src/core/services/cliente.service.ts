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

  async create(data: any) {
    const {
      contratos,
      bairro,
      contrato,
      cidade,
      estado,
      cep,
      regiao,
      tipo_contrato,
      valor_contrato,
      horario_inicio,
      horario_fim,
      ...clienteData
    } = data;
    if ('id' in clienteData) delete clienteData.id;
    // Conversão dos campos numéricos dos contratos
    const parseNumber = (v: any) => {
      if (v === undefined || v === null || v === "") return null;
      const n = Number(String(v).replace(/[^\d.,-]/g, '').replace(',', '.'));
      return isNaN(n) ? null : n;
    };
    const contratosConvertidos = contratos && Array.isArray(contratos)
      ? contratos.map((c: any) => {
          const { id, clienteId, ...rest } = c;
          return {
            ...rest,
            valor_acionamento: parseNumber(c.valor_acionamento),
            valor_nao_recuperado: parseNumber(c.valor_nao_recuperado),
            valor_hora_extra: parseNumber(c.valor_hora_extra),
            valor_km_extra: parseNumber(c.valor_km_extra),
            franquia_km: parseNumber(c.franquia_km),
            valor_km: parseNumber(c.valor_km),
            valor_base: parseNumber(c.valor_base)
          };
        })
      : undefined;
    const cliente = await this.prisma.cliente.create({
      data: {
        ...clienteData,
        bairro,
        cidade,
        estado,
        cep,
        ...(clienteData.logo && { logo: clienteData.logo }),
        camposAdicionais: clienteData.camposAdicionais ? {
          create: clienteData.camposAdicionais
        } : undefined,
        contratos: contratosConvertidos ? {
          create: contratosConvertidos
        } : undefined
      },
      include: {
        camposAdicionais: true,
        contratos: true
      }
    });
    return cliente;
  }

  async update(id: number, data: any) {
    if (data.camposAdicionais) {
      await this.prisma.campoAdicionalCliente.deleteMany({
        where: { clienteId: id }
      });
    }
    if (data.contratos) {
      await this.prisma.contrato.deleteMany({ where: { clienteId: id } });
    }
    const {
      contratos,
      bairro,
      contrato,
      regiao,
      cidade,
      estado,
      cep,
      tipo_contrato,
      valor_contrato,
      horario_inicio,
      horario_fim,
      ...clienteData
    } = data;
    if ('id' in clienteData) delete clienteData.id;
    // Conversão dos campos numéricos dos contratos
    const parseNumber = (v: any) => {
      if (v === undefined || v === null || v === "") return null;
      const n = Number(String(v).replace(/[^\d.,-]/g, '').replace(',', '.'));
      return isNaN(n) ? null : n;
    };
    const contratosConvertidos = contratos && Array.isArray(contratos)
      ? contratos.map((c: any) => {
          const { id, clienteId, ...rest } = c;
          return {
            ...rest,
            valor_acionamento: parseNumber(c.valor_acionamento),
            valor_nao_recuperado: parseNumber(c.valor_nao_recuperado),
            valor_hora_extra: parseNumber(c.valor_hora_extra),
            valor_km_extra: parseNumber(c.valor_km_extra),
            franquia_km: parseNumber(c.franquia_km),
            valor_km: parseNumber(c.valor_km),
            valor_base: parseNumber(c.valor_base)
          };
        })
      : undefined;
    const cliente = await this.prisma.cliente.update({
      where: { id },
      data: {
        ...clienteData,
        bairro,
        cidade,
        estado,
        cep,
        ...(clienteData.logo !== undefined && { logo: clienteData.logo }),
        camposAdicionais: clienteData.camposAdicionais ? {
          create: clienteData.camposAdicionais
        } : undefined,
        contratos: contratosConvertidos ? {
          create: contratosConvertidos
        } : undefined
      },
      include: {
        camposAdicionais: true,
        contratos: true
      }
    });
    return cliente;
  }

  async delete(id: number) {
    await this.prisma.campoAdicionalCliente.deleteMany({
      where: { clienteId: id }
    });
    await this.prisma.contrato.deleteMany({
      where: { clienteId: id }
    });
    return this.prisma.cliente.delete({
      where: { id }
    });
  }
} 