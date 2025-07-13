import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../../../shared/errors/AppError';
import { validateRequiredFields, validateEnum } from '../../../utils/validation';
import { OcorrenciaStatusEnum } from '../../../types/enums';

const ocorrenciaSchema = z.object({
  placa1: z.string().min(7).max(8),
  placa2: z.string().min(7).max(8).nullable().optional(),
  placa3: z.string().min(7).max(8).nullable().optional(),
  modelo1: z.string().nullable().optional(),
  cor1: z.string().nullable().optional(),
  cliente: z.string().min(1),
  tipo: z.string().min(1),
  tipo_veiculo: z.string().nullable().optional(),
  coordenadas: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
  cpf_condutor: z.string().nullable().optional(),
  nome_condutor: z.string().nullable().optional(),
  transportadora: z.string().nullable().optional(),
  valor_carga: z.number().nullable().optional(),
  notas_fiscais: z.string().nullable().optional(),
  os: z.string().nullable().optional(),
  origem_bairro: z.string().nullable().optional(),
  origem_cidade: z.string().nullable().optional(),
  origem_estado: z.string().nullable().optional(),
  prestador: z.string().nullable().optional(),
  inicio: z.union([z.string(), z.date()]).nullable().optional(),
  chegada: z.union([z.string(), z.date()]).nullable().optional(),
  termino: z.union([z.string(), z.date()]).nullable().optional(),
  km: z.number().nullable().optional(),
  km_inicial: z.number().nullable().optional(),
  km_final: z.number().nullable().optional(),
  despesas: z.number().nullable().optional(),
  despesas_detalhadas: z.any().nullable().optional(),
  descricao: z.string().nullable().optional(),
  resultado: z.string().nullable().optional(),
  status: z.enum(['em_andamento', 'concluida', 'cancelada', 'aguardando']).optional(),
  data_acionamento: z.union([z.string(), z.date()]).nullable().optional(),
  fotos: z.array(z.object({
    url: z.string(),
    legenda: z.string().optional()
  })).optional()
});

const requiredFields = ['placa1', 'cliente', 'tipo'];

export const validateCreateOcorrencia = [
  validateRequiredFields(requiredFields),
  validateEnum('status', OcorrenciaStatusEnum)
];

export const validateUpdateOcorrencia = [
  validateEnum('status', OcorrenciaStatusEnum)
];

export const validateOcorrencia = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const validatedData = ocorrenciaSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      throw new AppError('Dados inválidos', 400, error.errors[0].message);
    }
    next(error);
  }
}; 