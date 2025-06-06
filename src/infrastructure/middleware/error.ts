import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('❌ Erro capturado:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    realIp: req.get('x-real-ip'),
    forwardedFor: req.get('x-forwarded-for')
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors: err.errors
    });
    return;
  }

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Erro interno do servidor'
  });
} 