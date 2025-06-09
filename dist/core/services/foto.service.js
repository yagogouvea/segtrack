"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FotoService = void 0;
class FotoService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        return this.prisma.foto.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async findById(id) {
        return this.prisma.foto.findUnique({
            where: { id }
        });
    }
    async upload(data) {
        return this.prisma.foto.create({
            data: {
                url: data.url,
                legenda: data.legenda,
                ocorrenciaId: data.ocorrenciaId
            }
        });
    }
    async delete(id) {
        return this.prisma.foto.delete({
            where: { id }
        });
    }
}
exports.FotoService = FotoService;
