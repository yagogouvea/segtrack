import { Request, Response, NextFunction } from 'express';
import { corsConfig } from '../config/cors.config';

// Interface para logs do CORS
interface CorsLog {
  timestamp: string;
  method: string;
  path: string;
  origin: string;
  allowed: boolean;
  reason?: string;
}

// Função para gerar log estruturado
function createCorsLog(req: Request, allowed: boolean, reason?: string): CorsLog {
  return {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    origin: req.headers.origin || 'no-origin',
    allowed,
    reason
  };
}

// Função para log colorido no console
function logCorsRequest(log: CorsLog): void {
  const status = log.allowed ? '✅' : '❌';
  const originColor = log.allowed ? '\x1b[32m' : '\x1b[31m'; // verde ou vermelho
  
  console.log(
    `🌐 [CORS] ${status} ${log.timestamp}\n` +
    `   Method: ${log.method}\n` +
    `   Path: ${log.path}\n` +
    `   Origin: ${originColor}${log.origin}\x1b[0m\n` +
    (log.reason ? `   Reason: ${log.reason}\n` : '')
  );
}

export const corsHandler = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  // Log da requisição para debug
  console.log(`🔒 CORS Request:
  - Origin: ${origin}
  - Method: ${req.method}
  - Path: ${req.path}
  - Headers: ${JSON.stringify(req.headers)}`);

  // Se não há origem, permite a requisição (ex: Postman)
  if (!origin) {
    console.log('✅ CORS: No origin, allowing request');
    return next();
  }

  // Verifica se a origem é permitida
  const isAllowed = corsConfig.isOriginAllowed(origin);
  console.log(`🔍 CORS Origin Check: ${origin} - ${isAllowed ? 'Allowed' : 'Blocked'}`);

  if (!isAllowed) {
    console.log(`❌ CORS: Blocked origin ${origin}`);
    return res.status(403).json({
      error: 'CORS Error',
      message: `Origem ${origin} não permitida`,
      allowedOrigins: corsConfig.origins
    });
  }

  // Configura os headers CORS
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  res.header('Access-Control-Allow-Headers', corsConfig.headers.join(', '));
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', corsConfig.maxAge.toString());

  // Log dos headers configurados
  console.log(`✅ CORS Headers Set:
  - Allow-Origin: ${origin}
  - Allow-Methods: ${corsConfig.methods.join(', ')}
  - Allow-Headers: ${corsConfig.headers.join(', ')}
  - Allow-Credentials: true
  - Max-Age: ${corsConfig.maxAge}`);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS: Responding to preflight request');
    return res.status(204).end();
  }

  next();
};

// Exporta a configuração para uso em testes ou customização
export { corsConfig }; 