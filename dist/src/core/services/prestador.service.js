"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrestadorService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../errors/AppError");
const prisma = new client_1.PrismaClient();
class PrestadorService {
    async findAll() {
        try {
            return await prisma.prestador.findMany({
                include: {
                    funcoes: true,
                    veiculos: true,
                    regioes: true
                }
            });
        }
        catch (error) {
            console.error('Erro ao buscar prestadores:', error);
            throw new AppError_1.AppError('Erro ao buscar prestadores');
        }
    }
    async findById(id) {
        try {
            const prestador = await prisma.prestador.findUnique({
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
            return await prisma.prestador.create({
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
            // Verificar se o prestador existe
            await this.findById(id);
            // Deletar relacionamentos existentes
            await prisma.$transaction([
                prisma.funcaoPrestador.deleteMany({
                    where: { prestadorId: id }
                }),
                prisma.tipoVeiculoPrestador.deleteMany({
                    where: { prestadorId: id }
                }),
                prisma.regiaoPrestador.deleteMany({
                    where: { prestadorId: id }
                })
            ]);
            // Atualizar prestador com novos dados
            return await prisma.prestador.update({
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
            // Verificar se o prestador existe
            await this.findById(id);
            // Deletar prestador e seus relacionamentos
            await prisma.$transaction([
                prisma.funcaoPrestador.deleteMany({
                    where: { prestadorId: id }
                }),
                prisma.tipoVeiculoPrestador.deleteMany({
                    where: { prestadorId: id }
                }),
                prisma.regiaoPrestador.deleteMany({
                    where: { prestadorId: id }
                }),
                prisma.prestador.delete({
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
            return await prisma.prestador.findMany({
                where: {
                    regioes: {
                        some: {
                            regiao: {
                                contains: regiao
                            }
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
            return await prisma.prestador.findMany({
                where: {
                    funcoes: {
                        some: {
                            funcao: {
                                contains: funcao
                            }
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
//# sourceMappingURL=prestador.service.js.map