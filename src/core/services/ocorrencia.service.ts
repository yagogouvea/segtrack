import { Prisma, Ocorrencia } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';
import { CreateOcorrenciaDTO, UpdateOcorrenciaDTO, OcorrenciaStatus } from '@/types/prisma';
import { ensurePrisma } from '@/lib/prisma';

interface ListOcorrenciaFilters {
  status?: OcorrenciaStatus;
  placa?: string;
  cliente?: string;
  data_inicio?: Date;
  data_fim?: Date;
}

export class OcorrenciaService {
  async list(filters: ListOcorrenciaFilters & { id?: number, prestador?: string } = {}): Promise<Ocorrencia[]> {
    try {
      console.log('[OcorrenciaService] Iniciando listagem com filtros:', filters);
      
      const db = await ensurePrisma();
      if (!db) {
        console.error('[OcorrenciaService] Erro: Instância do Prisma não disponível');
        throw new AppError('Erro de conexão com o banco de dados');
      }

      const where: Prisma.OcorrenciaWhereInput = {};

      if (filters.id) {
        where.id = filters.id;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.placa) {
        where.OR = [
          { placa1: { contains: filters.placa, mode: 'insensitive' } },
          { placa2: { contains: filters.placa, mode: 'insensitive' } },
          { placa3: { contains: filters.placa, mode: 'insensitive' } }
        ];
      }

      if (filters.cliente) {
        where.cliente = {
          contains: filters.cliente
        };
      }

      if (filters.prestador) {
        where.prestador = {
          contains: filters.prestador
        };
      }

      function parseDateLocalToUTC(dateStr: string | Date) {
        if (dateStr instanceof Date) return dateStr;
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day, 3, 0, 0));
      }

      if (filters.data_inicio || filters.data_fim) {
        where.data_acionamento = {};
        if (filters.data_inicio) {
          where.data_acionamento.gte = parseDateLocalToUTC(filters.data_inicio);
        }
        if (filters.data_fim) {
          const dataFim = parseDateLocalToUTC(filters.data_fim);
          const dataFimExclusive = new Date(dataFim);
          dataFimExclusive.setUTCDate(dataFim.getUTCDate() + 1);
          where.data_acionamento.lt = dataFimExclusive;
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
      return ocorrencias;
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
      console.log('📝 Dados recebidos para criar ocorrência:', data);
      
      if (!data.placa1 || !data.cliente || !data.tipo) {
        const camposFaltando = [];
        if (!data.placa1) camposFaltando.push('placa1');
        if (!data.cliente) camposFaltando.push('cliente');
        if (!data.tipo) camposFaltando.push('tipo');
        
        throw new AppError(`Campos obrigatórios faltando: ${camposFaltando.join(', ')}`, 400);
      }

      const db = await ensurePrisma();
      const { fotos, ...rest } = data;

      // Converter campos de data de string para Date se necessário
      const processedData: any = { ...rest };
      
      if (processedData.inicio && typeof processedData.inicio === 'string') {
        processedData.inicio = new Date(processedData.inicio);
      }
      if (processedData.chegada && typeof processedData.chegada === 'string') {
        processedData.chegada = new Date(processedData.chegada);
      }
      if (processedData.termino && typeof processedData.termino === 'string') {
        processedData.termino = new Date(processedData.termino);
      }
      if (processedData.data_acionamento && typeof processedData.data_acionamento === 'string') {
        processedData.data_acionamento = new Date(processedData.data_acionamento);
      }

      const ocorrencia = await db.ocorrencia.create({
        data: {
          ...processedData,
          status: data.status || 'em_andamento',
          criado_em: new Date(),
          atualizado_em: new Date(),
          despesas_detalhadas: data.despesas_detalhadas ?? Prisma.JsonNull,
          operador: data.operador,
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

      return ocorrencia;
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

      return ocorrencia;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao buscar ocorrência:', error);
      throw new AppError('Erro ao buscar ocorrência');
    }
  }

  async update(id: number, data: UpdateOcorrenciaDTO): Promise<Ocorrencia> {
    try {
      console.log('[OcorrenciaService] Iniciando atualização de ocorrência');
      console.log('[OcorrenciaService] ID:', id);
      console.log('[OcorrenciaService] Dados recebidos:', JSON.stringify(data, null, 2));
      
      const db = await ensurePrisma();
      const { fotos, despesas_detalhadas, ...rest } = data;

      // Converter campos de data de string para Date se necessário
      const processedData: any = { ...rest };
      
      if (processedData.inicio && typeof processedData.inicio === 'string') {
        processedData.inicio = new Date(processedData.inicio);
      }
      if (processedData.chegada && typeof processedData.chegada === 'string') {
        processedData.chegada = new Date(processedData.chegada);
      }
      if (processedData.termino && typeof processedData.termino === 'string') {
        processedData.termino = new Date(processedData.termino);
      }
      if (processedData.data_acionamento && typeof processedData.data_acionamento === 'string') {
        processedData.data_acionamento = new Date(processedData.data_acionamento);
      }

      console.log('[OcorrenciaService] Dados processados para atualização:', JSON.stringify(processedData, null, 2));
      console.log('[OcorrenciaService] Fotos:', fotos);
      console.log('[OcorrenciaService] Despesas detalhadas:', despesas_detalhadas);

      // Montar objeto de update
      const updateData: any = {
        ...processedData,
        atualizado_em: new Date(),
        operador: data.operador,
        fotos: fotos && fotos.length > 0 ? {
          create: fotos.map(foto => ({
            url: foto.url,
            legenda: foto.legenda || ''
          }))
        } : undefined
      };
      // Só sobrescreve despesas_detalhadas se vier no payload
      if (despesas_detalhadas !== undefined) {
        updateData.despesas_detalhadas = despesas_detalhadas;
      }

      const ocorrencia = await db.ocorrencia.update({
        where: { id },
        data: updateData,
        include: {
          fotos: true
        }
      });

      console.log('[OcorrenciaService] Ocorrência atualizada com sucesso:', ocorrencia.id);
      return ocorrencia;
    } catch (error) {
      console.error('[OcorrenciaService] Erro ao atualizar ocorrência:', {
        error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined
      });
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new AppError(`Erro no banco de dados: ${error.message} (código: ${error.code})`);
      }
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
      const db = await ensurePrisma();
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

      return ocorrencia;
    } catch (error) {
      console.error('Erro ao adicionar fotos:', error);
      throw new AppError('Erro ao adicionar fotos');
    }
  }
} 