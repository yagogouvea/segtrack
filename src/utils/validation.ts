import { Request, Response, NextFunction } from 'express';
import { sendResponse } from './response';

export const validateId = (req: Request, res: Response, next: NextFunction): void => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    sendResponse.badRequest(res, 'ID inválido');
    return;
  }
  next();
};

export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields = fields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      sendResponse.badRequest(res, `Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
      return;
    }
    next();
  };
};

export const validateEnum = <T extends { [key: string]: string }>(field: string, enumType: T) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.body[field];
    const validValues = Object.values(enumType);
    if (value && !validValues.includes(value)) {
      sendResponse.badRequest(res, `Valor inválido para o campo ${field}. Valores permitidos: ${validValues.join(', ')}`);
      return;
    }
    next();
  };
}; 