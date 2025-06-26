import { Prisma, Ocorrencia } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { CreateOcorrenciaDTO, UpdateOcorrenciaDTO, OcorrenciaStatus } from '../../types/prisma';
import { ensurePrisma } from '../../lib/prisma';

interface ListOcorrenciaFilters {
  status?: OcorrenciaStatus;
  placa?: string;
  cliente?: string;
  data_inicio?: Date;
  data_fim?: Date;
}

// Função para processar despesas_detalhadas de string JSON para array
const processarDespesasDetalhadas = (ocorrencia: any) => {
  if (ocorrencia.despesas_detalhadas) {
    try {
      if (typeof ocorrencia.despesas_detalhadas === 'string') {
        // Verificar se a string não está vazia
        if (ocorrencia.despesas_detalhadas.trim() === '') {
          ocorrencia.despesas_detalhadas = [];
        } else {
          ocorrencia.despesas_detalhadas = JSON.parse(ocorrencia.despesas_detalhadas);
        }
      }
      // Se já é um array, manter como está
      if (!Array.isArray(ocorrencia.despesas_detalhadas)) {
        ocorrencia.despesas_detalhadas = [];
      }
    } catch (error) {
      console.error('Erro ao processar despesas_detalhadas:', error);
      console.error('Valor recebido:', ocorrencia.despesas_detalhadas);
      ocorrencia.despesas_detalhadas = [];
    }
  } else {
    ocorrencia.despesas_detalhadas = [];
  }
  return ocorrencia;
};

export class OcorrenciaService {
  async list(filters: ListOcorrenciaFilters = {}): Promise<Ocorrencia[]> {
    try {
      console.log('[OcorrenciaService] Iniciando listagem com filtros:', filters);
      
      const db = await ensurePrisma();
      if (!db) {
        console.error('[OcorrenciaService] Erro: Instância do Prisma não disponível');
        throw new AppError('Erro de conexão com o banco de dados');
      }

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

      console.log('[OcorrenciaService] Query where:', where);

      const ocorrencias = await db.ocorrencia.findMany({
        where,
        include: {
          fotos: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });

      console.log('[OcorrenciaService] Ocorrências encontradas:', ocorrencias.length);
      return ocorrencias.map(processarDespesasDetalhadas);
    } catch (error) {
      console.error('[OcorrenciaService] Erro ao listar ocorrências:', {
        error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined
      });

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError(`Erro no banco de dados: ${error.message} (código: ${error.code})`);
      }
      throw new AppError('Erro ao listar ocorrências');
    }
  }

  async create(data: CreateOcorrenciaDTO): Promise<Ocorrencia> {
    try {
      if (!data.placa1 || !data.cliente || !data.tipo) {
        throw new AppError('Campos obrigatórios faltando: placa1, cliente, tipo', 400);
      }

      // Log para debug
      console.log('[DEBUG][CREATE OCORRENCIA] Dados recebidos:', JSON.stringify(data, null, 2));

      const db = await ensurePrisma();
      const { fotos, ...rest } = data;

      // Log para debug
      console.log('[DEBUG][CREATE OCORRENCIA] Dados enviados ao banco:', JSON.stringify(rest, null, 2));

      const ocorrencia = await db.ocorrencia.create({
        data: {
          ...rest,
          status: data.status || 'em_andamento',
          criado_em: new Date(),
          atualizado_em: new Date(),
          despesas_detalhadas: data.despesas_detalhadas ? JSON.stringify(data.despesas_detalhadas) : undefined,
          fotos: fotos && fotos.length > 0 ? {
            create: fotos.map(foto => ({
              url: foto.url,
              legenda: foto.legenda || ''
            }))
          } : undefined
        },
        include: {
          fotos: true
        }
      });

      // Log para debug
      console.log('[DEBUG][CREATE OCORRENCIA] Ocorrencia criada:', JSON.stringify(ocorrencia, null, 2));

      return processarDespesasDetalhadas(ocorrencia);
    } catch (error) {
      console.error('Erro ao criar ocorrência:', error);
      throw new AppError('Erro ao criar ocorrência');
    }
  }

  async findById(id: number): Promise<Ocorrencia> {
    try {
      const db = await ensurePrisma();
      const ocorrencia = await db.ocorrencia.findUnique({
        where: { id },
        include: {
          fotos: true
        }
      });

      if (!ocorrencia) {
        throw new AppError('Ocorrência não encontrada', 404);
      }

      return processarDespesasDetalhadas(ocorrencia);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao buscar ocorrência:', error);
      throw new AppError('Erro ao buscar ocorrência');
    }
  }

  async update(id: number, data: UpdateOcorrenciaDTO): Promise<Ocorrencia> {
    try {
      const db = await ensurePrisma();
      const { fotos, ...rest } = data;

      const ocorrencia = await db.ocorrencia.update({
        where: { id },
        data: {
          ...rest,
          atualizado_em: new Date(),
          despesas_detalhadas: data.despesas_detalhadas ? JSON.stringify(data.despesas_detalhadas) : undefined,
          fotos: fotos && fotos.length > 0 ? {
            create: fotos.map(foto => ({
              url: foto.url,
              legenda: foto.legenda || ''
            }))
          } : undefined
        },
        include: {
          fotos: true
        }
      });

      return processarDespesasDetalhadas(ocorrencia);
    } catch (error) {
      console.error('Erro ao atualizar ocorrência:', error);
      throw new AppError('Erro ao atualizar ocorrência');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const db = await ensurePrisma();
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
      const db = await ensurePrisma();
      const ocorrencias = await db.ocorrencia.findMany({
        where: { status },
        include: {
          fotos: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });

      return ocorrencias.map(processarDespesasDetalhadas);
    } catch (error) {
      console.error('Erro ao buscar ocorrências por status:', error);
      throw new AppError('Erro ao buscar ocorrências por status');
    }
  }

  async findByPlaca(placa: string): Promise<Ocorrencia[]> {
    try {
      const db = await ensurePrisma();
      const ocorrencias = await db.ocorrencia.findMany({
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

      return ocorrencias.map(processarDespesasDetalhadas);
    } catch (error) {
      console.error('Erro ao buscar ocorrências por placa:', error);
      throw new AppError('Erro ao buscar ocorrências por placa');
    }
  }

  async addFotos(id: number, urls: string[]): Promise<Ocorrencia> {
    try {
      const db = await ensurePrisma();
      const ocorrencia = await db.ocorrencia.update({
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

      return processarDespesasDetalhadas(ocorrencia);
    } catch (error) {
      console.error('Erro ao adicionar fotos:', error);
      throw new AppError('Erro ao adicionar fotos');
    }
  }
} 