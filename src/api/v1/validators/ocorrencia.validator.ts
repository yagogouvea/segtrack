import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../../../shared/errors/AppError';

const ocorrenciaSchema = z.object({
  placa1: z.string().min(7).max(8),
  placa2: z.string().min(7).max(8).optional(),
  placa3: z.string().min(7).max(8).optional(),
  modelo1: z.string().optional(),
  cor1: z.string().optional(),
  cliente: z.string().min(1),
  tipo: z.string().min(1),
  tipo_veiculo: z.string().optional(),
  coordenadas: z.string().optional(),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cpf_condutor: z.string().optional(),
  nome_condutor: z.string().optional(),
  transportadora: z.string().optional(),
  valor_carga: z.number().optional(),
  notas_fiscais: z.string().optional(),
  os: z.string().optional(),
  origem_bairro: z.string().optional(),
  origem_cidade: z.string().optional(),
  origem_estado: z.string().optional(),
  prestador: z.string().optional(),
  inicio: z.string().datetime().optional(),
  chegada: z.string().datetime().optional(),
  termino: z.string().datetime().optional(),
  km: z.number().optional(),
  despesas: z.number().optional(),
  descricao: z.string().optional(),
  resultado: z.string().optional(),
  status: z.enum(['Em andamento', 'Finalizada', 'Cancelada', 'Aguardando prestador']).optional(),
  data_acionamento: z.string().datetime().optional(),
  km_final: z.number().optional(),
  km_inicial: z.number().optional(),
  despesas_detalhadas: z.any().optional()
});

export const validateOcorrencia = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = ocorrenciaSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Dados inválidos', 400, error.errors[0].message);
    }
    next(error);
  }
}; 