"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteService = void 0;
class ClienteService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        return this.prisma.cliente.findMany({
            orderBy: { nome: 'asc' },
            include: {
                camposAdicionais: true
            }
        });
    }
    async findById(id) {
        return this.prisma.cliente.findUnique({
            where: { id },
            include: {
                camposAdicionais: true
            }
        });
    }
    async create(data) {
        return this.prisma.cliente.create({
            data: {
                nome: data.nome,
                cnpj: data.cnpj,
                contato: data.contato,
                telefone: data.telefone,
                email: data.email,
                endereco: data.endereco,
                camposAdicionais: {
                    create: data.camposAdicionais
                }
            },
            include: {
                camposAdicionais: true
            }
        });
    }
    async update(id, data) {
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
                camposAdicionais: data.camposAdicionais ? {
                    create: data.camposAdicionais
                } : undefined
            },
            include: {
                camposAdicionais: true
            }
        });
    }
    async delete(id) {
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
exports.ClienteService = ClienteService;
