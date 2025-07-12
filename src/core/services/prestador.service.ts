import { Prisma } from '@prisma/client';
import { AppError } from '../../errors/AppError';
import { ensurePrisma } from '../../lib/prisma';

interface PrestadorData {
  nome: string;
  cpf: string;
  cod_nome: string;
  telefone: string;
  email: string;
  tipo_pix: string;
  chave_pix: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  valor_acionamento: number;
  franquia_horas: string;
  franquia_km: number;
  valor_hora_adc: number;
  valor_km_adc: number;
  aprovado: boolean;
  modelo_antena?: string;
  funcoes: { funcao: string }[];
  veiculos: { tipo: string }[];
  regioes: { regiao: string }[];
}

// Função utilitária para normalizar texto (remover acentos e converter para minúsculas)
function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .trim();
}

// Função para obter coordenadas via geocodificação
async function getCoordinates(endereco: string, cidade: string, estado: string): Promise<{ latitude: number | null, longitude: number | null }> {
  try {
    // Validar se temos os dados mínimos necessários
    if (!endereco || !cidade || !estado) {
      console.log('⚠️ Dados de endereço incompletos:', { endereco, cidade, estado });
      return { latitude: null, longitude: null };
    }

    const enderecoCompleto = `${endereco}, ${cidade}, ${estado}, Brasil`;
    console.log('🔍 Geocodificando endereço:', enderecoCompleto);
    
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1`;
    
    const response = await fetch(url);
    const data = await response.json() as any[];
    
    if (data && data.length > 0) {
      const result = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
      console.log('✅ Coordenadas encontradas:', result);
      return result;
    }
    
    console.log('⚠️ Nenhuma coordenada encontrada para:', enderecoCompleto);
    return { latitude: null, longitude: null };
  } catch (error) {
    console.error('❌ Erro ao geocodificar endereço:', error);
    return { latitude: null, longitude: null };
  }
}

export class PrestadorService {
  async list(filters: any = {}, pagination: { page: number, pageSize: number } = { page: 1, pageSize: 20 }) {
    try {
      const db = await ensurePrisma();
      
      // Parâmetros de paginação
      const page = pagination.page || 1;
      const pageSize = pagination.pageSize || 20;
      const offset = (page - 1) * pageSize;

      // Se houver filtro de região/local, usar query bruta com unaccent
      if (filters.local && typeof filters.local === 'string' && filters.local.trim().length > 0) {
        console.log('🔍 Usando busca com unaccent para região:', filters.local);
        
        const valor = filters.local.trim();
        const likeValue = `%${valor}%`;

        // Montar condições WHERE para outros filtros
        let whereConditions = [];
        let params: any[] = [likeValue];
        let paramIndex = 2; // $1 já é o likeValue

        // Filtro por nome
        if (filters.nome) {
          whereConditions.push(`unaccent(lower(p.nome)) LIKE unaccent(lower($${paramIndex}))`);
          params.push(`%${filters.nome.toLowerCase()}%`);
          paramIndex++;
        }

        // Filtro por cod_nome
        if (filters.cod_nome) {
          whereConditions.push(`unaccent(lower(p.cod_nome)) LIKE unaccent(lower($${paramIndex}))`);
          params.push(`%${filters.cod_nome.toLowerCase()}%`);
          paramIndex++;
        }

        // Filtro por funções
        if (filters.funcoes && Array.isArray(filters.funcoes) && filters.funcoes.length > 0) {
          const funcoesPlaceholders = filters.funcoes.map((_: any, i: number) => `$${paramIndex + i}`).join(',');
          whereConditions.push(`EXISTS (
            SELECT 1 FROM "FuncaoPrestador" f 
            WHERE f."prestadorId" = p.id 
            AND unaccent(lower(f.funcao)) IN (${funcoesPlaceholders})
          )`);
          filters.funcoes.forEach((f: string) => params.push(f.toLowerCase()));
          paramIndex += filters.funcoes.length;
        }

        // Filtro por regiões específicas
        if (filters.regioes && Array.isArray(filters.regioes) && filters.regioes.length > 0) {
          const regioesPlaceholders = filters.regioes.map((_: any, i: number) => `$${paramIndex + i}`).join(',');
          whereConditions.push(`EXISTS (
            SELECT 1 FROM "RegiaoPrestador" r 
            WHERE r."prestadorId" = p.id 
            AND unaccent(lower(r.regiao)) IN (${regioesPlaceholders})
          )`);
          filters.regioes.forEach((r: string) => params.push(r.toLowerCase()));
          paramIndex += filters.regioes.length;
        }

        // Construir a cláusula WHERE completa
        const whereClause = whereConditions.length > 0 ? `AND ${whereConditions.join(' AND ')}` : '';

        // Query principal com unaccent para busca insensível a acentos
        const query = `
          SELECT DISTINCT p.*
          FROM "Prestador" p
          LEFT JOIN "RegiaoPrestador" r ON r."prestadorId" = p.id
          WHERE (
            unaccent(lower(COALESCE(p.bairro, ''))) LIKE unaccent(lower($1))
            OR unaccent(lower(COALESCE(p.cidade, ''))) LIKE unaccent(lower($1))
            OR unaccent(lower(COALESCE(p.estado, ''))) LIKE unaccent(lower($1))
            OR unaccent(lower(COALESCE(r.regiao, ''))) LIKE unaccent(lower($1))
          )
          ${whereClause}
          ORDER BY p.nome ASC
          LIMIT ${pageSize} OFFSET ${offset}
        `;

        // Query para contar total
        const countQuery = `
          SELECT COUNT(DISTINCT p.id) as total
          FROM "Prestador" p
          LEFT JOIN "RegiaoPrestador" r ON r."prestadorId" = p.id
          WHERE (
            unaccent(lower(COALESCE(p.bairro, ''))) LIKE unaccent(lower($1))
            OR unaccent(lower(COALESCE(p.cidade, ''))) LIKE unaccent(lower($1))
            OR unaccent(lower(COALESCE(p.estado, ''))) LIKE unaccent(lower($1))
            OR unaccent(lower(COALESCE(r.regiao, ''))) LIKE unaccent(lower($1))
          )
          ${whereClause}
        `;

        console.log('🔍 Query executada:', query);
        console.log('🔍 Parâmetros:', params);

        // Executar queries
        const data = await db.$queryRawUnsafe(query, ...params);
        const totalResult = await db.$queryRawUnsafe(countQuery, ...params) as any[];
        const total = Number(totalResult[0]?.total) || 0;

        // Buscar relacionamentos para os prestadores encontrados
        if (Array.isArray(data) && data.length > 0) {
          const prestadorIds = data.map((p: any) => p.id);
          
          const [funcoes, veiculos, regioes] = await Promise.all([
            db.funcaoPrestador.findMany({
              where: { prestadorId: { in: prestadorIds } },
              orderBy: { funcao: 'asc' }
            }),
            db.tipoVeiculoPrestador.findMany({
              where: { prestadorId: { in: prestadorIds } },
              orderBy: { tipo: 'asc' }
            }),
            db.regiaoPrestador.findMany({
              where: { prestadorId: { in: prestadorIds } },
              orderBy: { regiao: 'asc' }
            })
          ]);

          // Agrupar relacionamentos por prestador
          const funcoesPorPrestador = funcoes.reduce((acc: any, f) => {
            if (!acc[f.prestadorId]) acc[f.prestadorId] = [];
            acc[f.prestadorId].push(f);
            return acc;
          }, {});

          const veiculosPorPrestador = veiculos.reduce((acc: any, v) => {
            if (!acc[v.prestadorId]) acc[v.prestadorId] = [];
            acc[v.prestadorId].push(v);
            return acc;
          }, {});

          const regioesPorPrestador = regioes.reduce((acc: any, r) => {
            if (!acc[r.prestadorId]) acc[r.prestadorId] = [];
            acc[r.prestadorId].push(r);
            return acc;
          }, {});

          // Adicionar relacionamentos aos prestadores
          const prestadoresCompletos = data.map((prestador: any) => ({
            ...prestador,
            funcoes: funcoesPorPrestador[prestador.id] || [],
            veiculos: veiculosPorPrestador[prestador.id] || [],
            regioes: regioesPorPrestador[prestador.id] || []
          }));

          return {
            data: prestadoresCompletos,
            total,
            page,
            pageSize
          };
        }

        return {
          data: [],
          total: 0,
          page,
          pageSize
        };
      }

      // Fallback: busca normal do Prisma se não houver filtro de local/região
      console.log('🔍 Usando busca normal do Prisma');
      
      const where: any = {};
      
      // Se ambos nome e cod_nome são fornecidos, usar OR
      if (filters.nome && filters.cod_nome) {
        where.OR = [
          { nome: { contains: filters.nome, mode: 'insensitive' } },
          { cod_nome: { contains: filters.cod_nome, mode: 'insensitive' } }
        ];
      } else {
        // Caso contrário, usar filtros individuais
        if (filters.nome) {
          where.nome = { contains: filters.nome, mode: 'insensitive' };
        }
        if (filters.cod_nome) {
          where.cod_nome = { contains: filters.cod_nome, mode: 'insensitive' };
        }
      }
      if (filters.regioes && Array.isArray(filters.regioes) && filters.regioes.length > 0) {
        where.regioes = { some: { regiao: { in: filters.regioes } } };
      }
      if (filters.funcoes && Array.isArray(filters.funcoes) && filters.funcoes.length > 0) {
        where.funcoes = { some: { funcao: { in: filters.funcoes } } };
      }

      const skip = (pagination.page - 1) * pagination.pageSize;
      const take = pagination.pageSize;

      const [data, total] = await Promise.all([
        db.prestador.findMany({
          where,
          include: {
            funcoes: true,
            veiculos: true,
            regioes: true
          },
          skip,
          take,
          orderBy: { nome: 'asc' }
        }),
        db.prestador.count({ where })
      ]);

      return {
        data,
        total,
        page: pagination.page,
        pageSize: pagination.pageSize
      };
    } catch (error) {
      console.error('❌ Erro ao buscar prestadores:', error);
      throw new AppError('Erro ao buscar prestadores');
    }
  }

  async listPublic() {
    try {
      const db = await ensurePrisma();
      return await db.prestador.findMany({
        where: { aprovado: true },
        include: {
          funcoes: true,
          veiculos: true,
          regioes: true
        }
      });
    } catch (error) {
      console.error('Erro ao buscar prestadores públicos:', error);
      throw new AppError('Erro ao buscar prestadores públicos');
    }
  }

  async findById(id: number) {
    try {
      const db = await ensurePrisma();
      const prestador = await db.prestador.findUnique({
        where: { id },
        include: {
          funcoes: true,
          veiculos: true,
          regioes: true
        }
      });

      if (!prestador) {
        throw new AppError('Prestador não encontrado', 404);
      }

      return prestador;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao buscar prestador:', error);
      throw new AppError('Erro ao buscar prestador');
    }
  }

  async create(data: PrestadorData) {
    try {
      const db = await ensurePrisma();
      
      // Obter coordenadas automaticamente
      const coordinates = await getCoordinates(data.endereco, data.cidade, data.estado);
      
      return await db.prestador.create({
        data: {
          nome: data.nome,
          cpf: data.cpf,
          cod_nome: data.cod_nome,
          telefone: data.telefone,
          email: data.email,
          tipo_pix: data.tipo_pix,
          chave_pix: data.chave_pix,
          cep: data.cep,
          endereco: data.endereco,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          valor_acionamento: data.valor_acionamento,
          franquia_horas: data.franquia_horas,
          franquia_km: data.franquia_km,
          valor_hora_adc: data.valor_hora_adc,
          valor_km_adc: data.valor_km_adc,
          aprovado: data.aprovado,
          modelo_antena: data.modelo_antena,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          funcoes: {
            create: data.funcoes
          },
          veiculos: {
            create: data.veiculos
          },
          regioes: {
            create: data.regioes
          }
        },
        include: {
          funcoes: true,
          veiculos: true,
          regioes: true
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('Já existe um prestador com este CPF ou email');
        }
      }
      console.error('Erro ao criar prestador:', error);
      throw new AppError('Erro ao criar prestador');
    }
  }

  async update(id: number, data: PrestadorData) {
    try {
      const db = await ensurePrisma();
      // Verificar se o prestador existe
      const prestadorExistente = await this.findById(id);

      // Obter coordenadas automaticamente sempre que o endereço for atualizado
      console.log('📍 Atualizando coordenadas para endereço:', data.endereco, data.cidade, data.estado);
      const coordinates = await getCoordinates(data.endereco, data.cidade, data.estado);
      
      if (coordinates.latitude && coordinates.longitude) {
        console.log('✅ Coordenadas obtidas:', coordinates);
      } else {
        console.log('⚠️ Não foi possível obter coordenadas para o endereço');
      }

      // Deletar relacionamentos existentes
      await db.$transaction([
        db.funcaoPrestador.deleteMany({
          where: { prestadorId: id }
        }),
        db.tipoVeiculoPrestador.deleteMany({
          where: { prestadorId: id }
        }),
        db.regiaoPrestador.deleteMany({
          where: { prestadorId: id }
        })
      ]);

      // Atualizar prestador com novos dados
      return await db.prestador.update({
        where: { id },
        data: {
          nome: data.nome,
          cpf: data.cpf,
          cod_nome: data.cod_nome,
          telefone: data.telefone,
          email: data.email,
          tipo_pix: data.tipo_pix,
          chave_pix: data.chave_pix,
          cep: data.cep,
          endereco: data.endereco,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          valor_acionamento: data.valor_acionamento,
          franquia_horas: data.franquia_horas,
          franquia_km: data.franquia_km,
          valor_hora_adc: data.valor_hora_adc,
          valor_km_adc: data.valor_km_adc,
          aprovado: data.aprovado,
          modelo_antena: data.modelo_antena,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          funcoes: {
            create: data.funcoes
          },
          veiculos: {
            create: data.veiculos
          },
          regioes: {
            create: data.regioes
          }
        },
        include: {
          funcoes: true,
          veiculos: true,
          regioes: true
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('Já existe um prestador com este CPF ou email');
        }
      }
      console.error('Erro ao atualizar prestador:', error);
      throw new AppError('Erro ao atualizar prestador');
    }
  }

  async delete(id: number) {
    try {
      const db = await ensurePrisma();
      // Verificar se o prestador existe
      await this.findById(id);

      // Deletar prestador e seus relacionamentos
      await db.$transaction([
        db.funcaoPrestador.deleteMany({
          where: { prestadorId: id }
        }),
        db.tipoVeiculoPrestador.deleteMany({
          where: { prestadorId: id }
        }),
        db.regiaoPrestador.deleteMany({
          where: { prestadorId: id }
        }),
        db.prestador.delete({
          where: { id }
        })
      ]);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Erro ao deletar prestador:', error);
      throw new AppError('Erro ao deletar prestador');
    }
  }

  async findByRegiao(regiao: string) {
    try {
      const db = await ensurePrisma();
      return await db.prestador.findMany({
        where: {
          regioes: {
            some: {
              regiao
            }
          }
        },
        include: {
          funcoes: true,
          veiculos: true,
          regioes: true
        }
      });
    } catch (error) {
      console.error('Erro ao buscar prestadores por região:', error);
      throw new AppError('Erro ao buscar prestadores por região');
    }
  }

  async findByFuncao(funcao: string) {
    try {
      const db = await ensurePrisma();
      return await db.prestador.findMany({
        where: {
          funcoes: {
            some: {
              funcao
            }
          }
        },
        include: {
          funcoes: true,
          veiculos: true,
          regioes: true
        }
      });
    } catch (error) {
      console.error('Erro ao buscar prestadores por função:', error);
      throw new AppError('Erro ao buscar prestadores por função');
    }
  }

  async listMapa() {
    const db = await ensurePrisma();
    return db.prestador.findMany({
      select: {
        id: true,
        nome: true,
        telefone: true, // Adicionado telefone
        latitude: true,
        longitude: true,
        cidade: true,
        estado: true,
        bairro: true,
        regioes: { select: { regiao: true } },
        funcoes: { select: { funcao: true } } // Adicionado tipo de apoio
      }
    });
  }
} 