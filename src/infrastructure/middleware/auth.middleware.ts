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
    console.log('[auth.middleware] URL:', req.url);
    console.log('[auth.middleware] Method:', req.method);
    console.log('[auth.middleware] Headers:', req.headers);
    console.log('[auth.middleware] Authorization header:', req.headers.authorization);
    console.log('[auth.middleware] JWT_SECRET:', process.env.JWT_SECRET ? 'PRESENTE' : 'AUSENTE');
    
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
    console.log('[auth.middleware] Token recebido:', token.substring(0, 20) + '...');
    
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

    // Garantir que permissions seja sempre um array de strings
    let parsedPermissions: string[] = [];
    try {
      if (Array.isArray(user.permissions)) {
        parsedPermissions = user.permissions;
      } else if (typeof user.permissions === 'string') {
        parsedPermissions = JSON.parse(user.permissions);
      } else {
        parsedPermissions = [];
      }
    } catch (e) {
      console.error('[auth.middleware] Erro ao parsear permissions:', user.permissions, e);
      parsedPermissions = [];
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: parsedPermissions,
    };

    console.log('[auth.middleware] Autenticação concluída com sucesso');
    console.log('[auth.middleware] Usuário final:', req.user);
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
    console.log('[requirePermission] Verificando permissão:', permission);
    console.log('[requirePermission] Usuário:', req.user);
    console.log('[requirePermission] URL:', req.url);
    console.log('[requirePermission] Method:', req.method);
    
    if (!req.user) {
      console.log('[requirePermission] Usuário não autenticado');
      sendResponse.unauthorized(res, 'Usuário não autenticado');
      return;
    }

    // Admin tem todas as permissões
    if (req.user.role === 'admin') {
      console.log('[requirePermission] Usuário é admin, permitindo acesso');
      next();
      return;
    }

    const perms = Array.isArray(req.user.permissions)
      ? req.user.permissions
      : typeof req.user.permissions === 'string'
        ? JSON.parse(req.user.permissions)
        : [];
    
    console.log('[requirePermission] Permissões do usuário:', perms);
    console.log('[requirePermission] Permissão necessária:', permission);
    
    if (!perms.includes(permission)) {
      console.log('[requirePermission] Acesso negado - permissão não encontrada');
      sendResponse.forbidden(res, 'Acesso negado');
      return;
    }

    console.log('[requirePermission] Permissão concedida');
    next();
  };
}; 