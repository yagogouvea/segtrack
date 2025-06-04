import { Request, Response, NextFunction } from 'express';

interface SanitizedOcorrencia {
  id: number;
  tipo: string;
  status: string;
  data_acionamento: string;
  cliente?: string;
  tipo_veiculo?: string;
  coordenadas?: string;
}

export const sanitizeOcorrenciaData = (data: any): SanitizedOcorrencia => {
  return {
    id: data.id,
    tipo: data.tipo,
    status: data.status,
    data_acionamento: data.data_acionamento,
    cliente: data.cliente,
    tipo_veiculo: data.tipo_veiculo,
    coordenadas: data.coordenadas
  };
};

export const sanitizeResponseData = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function (data: any) {
      // Se a rota contém 'ocorrencias', sanitiza os dados
      if (req.path.includes('ocorrencias')) {
        if (Array.isArray(data)) {
          data = data.map(item => sanitizeOcorrenciaData(item));
        } else if (data && typeof data === 'object') {
          data = sanitizeOcorrenciaData(data);
        }
      }

      // Remove campos sensíveis gerais
      if (data && typeof data === 'object') {
        const sensitiveFields = [
          'senha', 'password', 'token', 'secret',
          'placa1', 'placa2', 'placa3', 'placa4',
          'cpf', 'rg', 'telefone', 'email',
          'chave_pix', 'endereco'
        ];

        const removeSensitiveData = (obj: any) => {
          if (Array.isArray(obj)) {
            return obj.map(item => removeSensitiveData(item));
          }
          
          if (obj && typeof obj === 'object') {
            const sanitized = { ...obj };
            sensitiveFields.forEach(field => {
              if (field in sanitized) {
                if (typeof sanitized[field] === 'string') {
                  // Mascara parcialmente os dados sensíveis
                  sanitized[field] = sanitized[field].replace(/./g, '*');
                } else {
                  delete sanitized[field];
                }
              }
            });
            return sanitized;
          }
          return obj;
        };

        data = removeSensitiveData(data);
      }

      return originalJson.call(this, data);
    };

    next();
  };
}; 