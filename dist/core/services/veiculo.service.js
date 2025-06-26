"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeiculoService = void 0;
class VeiculoService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        return this.prisma.veiculo.findMany({
            orderBy: { placa: 'asc' }
        });
    }
    async findById(id) {
        return this.prisma.veiculo.findUnique({
            where: { id }
        });
    }
    async create(data) {
        return this.prisma.veiculo.create({
            data
        });
    }
    async update(id, data) {
        return this.prisma.veiculo.update({
            where: { id },
            data
        });
    }
    async delete(id) {
        return this.prisma.veiculo.delete({
            where: { id }
        });
    }
}
exports.VeiculoService = VeiculoService;
