"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrestadorService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../errors/AppError");
const prisma_1 = require("../../lib/prisma");
class PrestadorService {
    async list(filters = {}, pagination = { page: 1, pageSize: 20 }) {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
            // Se não há filtros, retornar array direto para compatibilidade
            if (!filters.nome && !filters.cod_nome && !filters.regioes && !filters.funcoes) {
                return await db.prestador.findMany({
                    include: {
                        funcoes: true,
                        veiculos: true,
                        regioes: true
                    },
                    orderBy: { nome: 'asc' }
                });
            }
            // Se há filtros, aplicar lógica de filtros e paginação
            const where = {};
            if (filters.nome) {
                where.nome = { contains: filters.nome, mode: 'insensitive' };
            }
            if (filters.cod_nome) {
                where.cod_nome = { contains: filters.cod_nome, mode: 'insensitive' };
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
        }
        catch (error) {
            console.error('Erro ao buscar prestadores:', error);
            throw new AppError_1.AppError('Erro ao buscar prestadores');
        }
    }
    async listPublic() {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
            return await db.prestador.findMany({
                where: { aprovado: true },
                include: {
                    funcoes: true,
                    veiculos: true,
                    regioes: true
                }
            });
        }
        catch (error) {
            console.error('Erro ao buscar prestadores públicos:', error);
            throw new AppError_1.AppError('Erro ao buscar prestadores públicos');
        }
    }
    async findById(id) {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
            const prestador = await db.prestador.findUnique({
                where: { id },
                include: {
                    funcoes: true,
                    veiculos: true,
                    regioes: true
                }
            });
            if (!prestador) {
                throw new AppError_1.AppError('Prestador não encontrado', 404);
            }
            return prestador;
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                throw error;
            console.error('Erro ao buscar prestador:', error);
            throw new AppError_1.AppError('Erro ao buscar prestador');
        }
    }
    async create(data) {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
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
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new AppError_1.AppError('Já existe um prestador com este CPF ou email');
                }
            }
            console.error('Erro ao criar prestador:', error);
            throw new AppError_1.AppError('Erro ao criar prestador');
        }
    }
    async update(id, data) {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
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
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                throw error;
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new AppError_1.AppError('Já existe um prestador com este CPF ou email');
                }
            }
            console.error('Erro ao atualizar prestador:', error);
            throw new AppError_1.AppError('Erro ao atualizar prestador');
        }
    }
    async delete(id) {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
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
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                throw error;
            console.error('Erro ao deletar prestador:', error);
            throw new AppError_1.AppError('Erro ao deletar prestador');
        }
    }
    async findByRegiao(regiao) {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
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
        }
        catch (error) {
            console.error('Erro ao buscar prestadores por região:', error);
            throw new AppError_1.AppError('Erro ao buscar prestadores por região');
        }
    }
    async findByFuncao(funcao) {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
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
        }
        catch (error) {
            console.error('Erro ao buscar prestadores por função:', error);
            throw new AppError_1.AppError('Erro ao buscar prestadores por função');
        }
    }
}
exports.PrestadorService = PrestadorService;
