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
  funcoes: { funcao: string }[];
  veiculos: { tipo: string }[];
  regioes: { regiao: string }[];
}

export class PrestadorService {
  async list() {
    try {
      const db = await ensurePrisma();
      const prestadores = await db.prestador.findMany({
        include: {
          funcoes: true,
          veiculos: true,
          regioes: true
        }
      });
      
      // Formatar os dados para o frontend
      return prestadores.map(prestador => ({
        ...prestador,
        funcoes: prestador.funcoes.map(f => f.funcao),
        regioes: prestador.regioes.map(r => r.regiao),
        tipo_veiculo: prestador.veiculos.map(v => v.tipo),
        veiculos: prestador.veiculos
      }));
    } catch (error) {
      console.error('Erro ao buscar prestadores:', error);
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
      await this.findById(id);

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

  /**
   * Busca prestadores com múltiplos filtros combináveis
   * @param filters { nome, cod_nome, regiao, funcao }
   */
  async searchWithFilters(filters: {
    nome?: string;
    cod_nome?: string;
    regiao?: string;
    funcao?: string;
  }) {
    try {
      const db = await ensurePrisma();
      console.log('🔍 Filtros recebidos:', filters);
      
      const where: any = {};
      
      if (filters.nome && filters.nome.trim()) {
        where.nome = { contains: filters.nome.trim() };
      }
      if (filters.cod_nome && filters.cod_nome.trim()) {
        where.cod_nome = { contains: filters.cod_nome.trim() };
      }
      if (filters.regiao && filters.regiao.trim()) {
        where.regioes = {
          some: {
            regiao: { contains: filters.regiao.trim() }
          }
        };
      }
      if (filters.funcao && filters.funcao.trim()) {
        where.funcoes = {
          some: {
            funcao: { contains: filters.funcao.trim() }
          }
        };
      }
      
      console.log('🔍 Where clause:', JSON.stringify(where, null, 2));
      
      const result = await db.prestador.findMany({
        where,
        include: {
          funcoes: true,
          veiculos: true,
          regioes: true
        }
      });
      
      console.log(`✅ Encontrados ${result.length} prestadores`);
      
      // Formatar os dados para o frontend
      return result.map(prestador => ({
        ...prestador,
        funcoes: prestador.funcoes.map(f => f.funcao),
        regioes: prestador.regioes.map(r => r.regiao),
        tipo_veiculo: prestador.veiculos.map(v => v.tipo),
        veiculos: prestador.veiculos
      }));
    } catch (error) {
      console.error('❌ Erro detalhado ao buscar prestadores com filtros:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('❌ Código do erro Prisma:', error.code);
        console.error('❌ Mensagem do erro Prisma:', error.message);
      }
      throw new AppError('Erro ao buscar prestadores com filtros');
    }
  }
} 