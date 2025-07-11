"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOcorrencia = exports.validateUpdateOcorrencia = exports.validateCreateOcorrencia = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../../../shared/errors/AppError");
const validation_1 = require("../../../utils/validation");
const enums_1 = require("../../../types/enums");
const ocorrenciaSchema = zod_1.z.object({
    placa1: zod_1.z.string().min(7).max(8),
    placa2: zod_1.z.string().min(7).max(8).nullable().optional(),
    placa3: zod_1.z.string().min(7).max(8).nullable().optional(),
    modelo1: zod_1.z.string().nullable().optional(),
    cor1: zod_1.z.string().nullable().optional(),
    cliente: zod_1.z.string().min(1),
    tipo: zod_1.z.string().min(1),
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
    inicio: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).nullable().optional(),
    chegada: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).nullable().optional(),
    termino: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).nullable().optional(),
    km: zod_1.z.number().nullable().optional(),
    km_inicial: zod_1.z.number().nullable().optional(),
    km_final: zod_1.z.number().nullable().optional(),
    despesas: zod_1.z.number().nullable().optional(),
    despesas_detalhadas: zod_1.z.any().nullable().optional(),
    descricao: zod_1.z.string().nullable().optional(),
    resultado: zod_1.z.string().nullable().optional(),
    status: zod_1.z.enum(['em_andamento', 'concluida', 'cancelada', 'aguardando']).optional(),
    data_acionamento: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).nullable().optional(),
    fotos: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string(),
        legenda: zod_1.z.string().optional()
    })).optional()
});
const requiredFields = ['placa1', 'cliente', 'tipo'];
exports.validateCreateOcorrencia = [
    (0, validation_1.validateRequiredFields)(requiredFields),
    (0, validation_1.validateEnum)('status', enums_1.OcorrenciaStatusEnum)
];
exports.validateUpdateOcorrencia = [
    (0, validation_1.validateEnum)('status', enums_1.OcorrenciaStatusEnum)
];
const validateOcorrencia = (req, _res, next) => {
    try {
        const validatedData = ocorrenciaSchema.parse(req.body);
        req.body = validatedData;
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw new AppError_1.AppError('Dados inválidos', 400, error.errors[0].message);
        }
        next(error);
    }
};
exports.validateOcorrencia = validateOcorrencia;
