import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { jsonUtils } from '../../utils/json';

interface JwtPayload {
  id: string;
  role: string;
  permissions: string[];
}

// Definição local do tipo UserRole para evitar erro de importação
type UserRole = 'admin' | 'manager' | 'operator' | 'client';

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
    console.log('[auth.middleware] Iniciando autenticação...');
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('[auth.middleware] Token não fornecido');
      sendResponse.unauthorized(res, 'Token não fornecido');
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('[auth.middleware] Token inválido (formato)');
      sendResponse.unauthorized(res, 'Token inválido');
      return;
    }

    console.log('[auth.middleware] Verificando token JWT...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload & { sub?: string };
    console.log('[auth.middleware] Token decodificado:', decoded);

    // Extrair userId do token (sub ou id)
    const userId = decoded.sub || decoded.id;
    if (!userId) {
      console.error('[auth.middleware] Token JWT malformado ou sem id/sub:', decoded);
      sendResponse.unauthorized(res, 'Token JWT malformado ou sem id/sub');
      return;
    }

    console.log('[auth.middleware] Buscando usuário no banco:', userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      console.log('[auth.middleware] Usuário não encontrado:', userId);
      sendResponse.unauthorized(res, 'Usuário não encontrado');
      return;
    }

    if (!user.active) {
      console.log('[auth.middleware] Usuário inativo:', userId);
      sendResponse.unauthorized(res, 'Usuário inativo');
      return;
    }

    console.log('[auth.middleware] Usuário encontrado:', user);

    const permissions = jsonUtils.parse(user.permissions);
    if (!Array.isArray(permissions)) {
      console.error('[auth.middleware] Formato de permissões inválido:', user.permissions);
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

    console.log('[auth.middleware] Autenticação concluída com sucesso');
    next();
  } catch (error) {
    console.error('[auth.middleware] Erro na autenticação:', error);
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