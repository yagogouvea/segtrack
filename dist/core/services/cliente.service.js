"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
                camposAdicionais: true,
                contratos: true
            }
        });
    }
    async findById(id) {
        return this.prisma.cliente.findUnique({
            where: { id },
            include: {
                camposAdicionais: true,
                contratos: true
            }
        });
    }
    async create(data) {
        const { contratos, bairro, contrato, cidade, estado, cep, regiao, tipo_contrato, valor_contrato, horario_inicio, horario_fim } = data, clienteData = __rest(data, ["contratos", "bairro", "contrato", "cidade", "estado", "cep", "regiao", "tipo_contrato", "valor_contrato", "horario_inicio", "horario_fim"]);
        if ('id' in clienteData)
            delete clienteData.id;
        // Conversão dos campos numéricos dos contratos
        const parseNumber = (v) => {
            if (v === undefined || v === null || v === "")
                return null;
            const n = Number(String(v).replace(/[^\d.,-]/g, '').replace(',', '.'));
            return isNaN(n) ? null : n;
        };
        const contratosConvertidos = contratos && Array.isArray(contratos)
            ? contratos.map((c) => {
                const { id, clienteId } = c, rest = __rest(c, ["id", "clienteId"]);
                return Object.assign(Object.assign({}, rest), { valor_acionamento: parseNumber(c.valor_acionamento), valor_nao_recuperado: parseNumber(c.valor_nao_recuperado), valor_hora_extra: parseNumber(c.valor_hora_extra), valor_km_extra: parseNumber(c.valor_km_extra), franquia_km: parseNumber(c.franquia_km), valor_km: parseNumber(c.valor_km), valor_base: parseNumber(c.valor_base) });
            })
            : undefined;
        const cliente = await this.prisma.cliente.create({
            data: Object.assign(Object.assign(Object.assign(Object.assign({}, clienteData), { bairro,
                cidade,
                estado,
                cep }), (clienteData.logo && { logo: clienteData.logo })), { camposAdicionais: clienteData.camposAdicionais ? {
                    create: clienteData.camposAdicionais
                } : undefined, contratos: contratosConvertidos ? {
                    create: contratosConvertidos
                } : undefined }),
            include: {
                camposAdicionais: true,
                contratos: true
            }
        });
        return cliente;
    }
    async update(id, data) {
        if (data.camposAdicionais) {
            await this.prisma.campoAdicionalCliente.deleteMany({
                where: { clienteId: id }
            });
        }
        if (data.contratos) {
            await this.prisma.contrato.deleteMany({ where: { clienteId: id } });
        }
        const { contratos, bairro, contrato, regiao, cidade, estado, cep, tipo_contrato, valor_contrato, horario_inicio, horario_fim } = data, clienteData = __rest(data, ["contratos", "bairro", "contrato", "regiao", "cidade", "estado", "cep", "tipo_contrato", "valor_contrato", "horario_inicio", "horario_fim"]);
        if ('id' in clienteData)
            delete clienteData.id;
        // Conversão dos campos numéricos dos contratos
        const parseNumber = (v) => {
            if (v === undefined || v === null || v === "")
                return null;
            const n = Number(String(v).replace(/[^\d.,-]/g, '').replace(',', '.'));
            return isNaN(n) ? null : n;
        };
        const contratosConvertidos = contratos && Array.isArray(contratos)
            ? contratos.map((c) => {
                const { id, clienteId } = c, rest = __rest(c, ["id", "clienteId"]);
                return Object.assign(Object.assign({}, rest), { valor_acionamento: parseNumber(c.valor_acionamento), valor_nao_recuperado: parseNumber(c.valor_nao_recuperado), valor_hora_extra: parseNumber(c.valor_hora_extra), valor_km_extra: parseNumber(c.valor_km_extra), franquia_km: parseNumber(c.franquia_km), valor_km: parseNumber(c.valor_km), valor_base: parseNumber(c.valor_base) });
            })
            : undefined;
        const cliente = await this.prisma.cliente.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign(Object.assign({}, clienteData), { bairro,
                cidade,
                estado,
                cep }), (clienteData.logo !== undefined && { logo: clienteData.logo })), { camposAdicionais: clienteData.camposAdicionais ? {
                    create: clienteData.camposAdicionais
                } : undefined, contratos: contratosConvertidos ? {
                    create: contratosConvertidos
                } : undefined }),
            include: {
                camposAdicionais: true,
                contratos: true
            }
        });
        return cliente;
    }
    async delete(id) {
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
exports.ClienteService = ClienteService;
