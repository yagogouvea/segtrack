"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocorrenciaSchema = void 0;
const zod_1 = require("zod");
exports.ocorrenciaSchema = zod_1.z.object({
    placa1: zod_1.z.string(),
    placa2: zod_1.z.string().nullable().optional(),
    placa3: zod_1.z.string().nullable().optional(),
    modelo1: zod_1.z.string().nullable().optional(),
    cor1: zod_1.z.string().nullable().optional(),
    cliente: zod_1.z.string(),
    tipo: zod_1.z.string(),
    tipo_veiculo: zod_1.z.string().nullable().optional(),
    coordenadas: zod_1.z.string().nullable().optional(),
    endereco: zod_1.z.string().nullable().optional(),
    bairro: zod_1.z.string().nullable().optional(),
    cidade: zod_1.z.string().nullable().optional(),
    estado: zod_1.z.string().nullable().optional(),
    cpf_condutor: zod_1.z.string().nullable().optional(),
    nome_condutor: zod_1.z.string().nullable().optional(),
    transportadora: zod_1.z.string().nullable().optional(),
    valor_carga: zod_1.z.number().nullable().optional(),
    notas_fiscais: zod_1.z.string().nullable().optional(),
    os: zod_1.z.string().nullable().optional(),
    origem_bairro: zod_1.z.string().nullable().optional(),
    origem_cidade: zod_1.z.string().nullable().optional(),
    origem_estado: zod_1.z.string().nullable().optional(),
    prestador: zod_1.z.string().nullable().optional(),
    inicio: zod_1.z.date().nullable().optional(),
    chegada: zod_1.z.date().nullable().optional(),
    termino: zod_1.z.date().nullable().optional(),
    km: zod_1.z.number().nullable().optional(),
    km_inicial: zod_1.z.number().nullable().optional(),
    km_final: zod_1.z.number().nullable().optional(),
    despesas: zod_1.z.number().nullable().optional(),
    despesas_detalhadas: zod_1.z.any().nullable().optional(),
    descricao: zod_1.z.string().nullable().optional(),
    resultado: zod_1.z.string().nullable().optional(),
    status: zod_1.z.string().default("Em andamento"),
    data_acionamento: zod_1.z.date().nullable().optional(),
    fotos: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string(),
        legenda: zod_1.z.string().optional().default(''),
    })).optional(),
});
