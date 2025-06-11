import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { jsonUtils } from '../../utils/json';
import { UserRole } from '@/types/user';

interface JwtPayload {
  id: string;
  role: string;
  permissions: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'upload';
type ResourceType = 
  | 'ocorrencia' 
  | 'foto' 
  | 'user' 
  | 'admin' 
  | 'manager' 
  | 'dashboard' 
  | 'relatorio' 
  | 'cliente' 
  | 'prestador';
type Permission = `${PermissionAction}:${ResourceType}`;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      sendResponse.unauthorized(res, 'Token não fornecido');
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      sendResponse.unauthorized(res, 'Token inválido');
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        active: true
      }
    });

    if (!user) {
      sendResponse.unauthorized(res, 'Usuário não encontrado');
      return;
    }

    if (!user.active) {
      sendResponse.unauthorized(res, 'Usuário inativo');
      return;
    }

    const permissions = jsonUtils.parse(user.permissions);
    if (!Array.isArray(permissions)) {
      sendResponse.error(res, new Error('Formato de permissões inválido'));
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: Array.isArray(user.permissions)
        ? user.permissions
        : typeof user.permissions === 'string'
          ? JSON.parse(user.permissions)
          : [],
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      sendResponse.unauthorized(res, 'Token inválido');
      return;
    }
    sendResponse.error(res, error);
  }
};

export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendResponse.unauthorized(res, 'Usuário não autenticado');
      return;
    }

    // Admin tem todas as permissões
    if (req.user.role === 'admin') {
      next();
      return;
    }

    const perms = Array.isArray(req.user.permissions)
      ? req.user.permissions
      : typeof req.user.permissions === 'string'
        ? JSON.parse(req.user.permissions)
        : [];
    if (!perms.includes(permission)) {
      sendResponse.forbidden(res, 'Acesso negado');
      return;
    }

    next();
  };
}; 