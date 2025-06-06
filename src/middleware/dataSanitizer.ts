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

export function sanitizeResponseData() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sanitizar dados da requisição
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key]
            .replace(/[<>]/g, '') // Remove tags HTML
            .trim();
        }
      });
    }

    // Sanitizar dados da resposta
    const originalSend = res.send;
    res.send = function(data) {
      if (typeof data === 'string') {
        data = data.replace(/[<>]/g, '').trim();
      } else if (typeof data === 'object' && data !== null) {
        data = JSON.parse(JSON.stringify(data).replace(/[<>]/g, ''));
      }
      return originalSend.call(this, data);
    };

    next();
  };
} 