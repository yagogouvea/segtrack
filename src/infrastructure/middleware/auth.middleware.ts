import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
// import { jsonUtils } from '../../utils/json'; // Comentando para evitar erro quando DATABASE_URL não está definida

interface JwtPayload {
  id: string;
  sub?: string;
  nome?: string;
  email?: string;
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

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('🔐 [Auth] Verificando autenticação para:', req.path);
    console.log('🔐 [Auth] Headers:', {
      authorization: req.headers.authorization ? 'PRESENTE' : 'AUSENTE',
      origin: req.headers.origin
    });

    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('❌ [Auth] Token não fornecido');
      return sendResponse.unauthorized(res, 'Token não fornecido');
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('❌ [Auth] Token inválido (formato)');
      return sendResponse.unauthorized(res, 'Token inválido');
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ [Auth] JWT_SECRET não configurado');
      return sendResponse.error(res, new Error('Erro de configuração do servidor'));
    }

    console.log('🔐 [Auth] Verificando token JWT...');
    // Verifica o token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    
    if (!decoded || (!decoded.id && !decoded.sub)) {
      console.log('❌ [Auth] Token inválido (decodificação)');
      return sendResponse.unauthorized(res, 'Token inválido');
    }

    // Usar 'id' ou 'sub' como identificador do usuário
    const userId = decoded.id || decoded.sub || '';
    
    if (!userId) {
      console.log('❌ [Auth] Token inválido (sem id ou sub)');
      return sendResponse.unauthorized(res, 'Token inválido');
    }

    console.log('✅ [Auth] Token JWT válido, decoded:', {
      id: userId,
      role: decoded.role,
      permissionsCount: decoded.permissions?.length || 0
    });
    console.log('🔎 [Auth] Permissões do token:', decoded.permissions);

    // Se é um token de desenvolvimento (sub='1'), usar dados do token
    if (decoded.sub === '1' || userId === '1') {
      console.log('🔧 [Auth] Token de desenvolvimento detectado - usando dados do token');
      req.user = {
        id: userId,
        name: decoded.nome || 'Admin SEGTRACK',
        email: decoded.email || 'admin@segtrack.com.br',
        role: decoded.role as UserRole,
        permissions: decoded.permissions || []
      };
      console.log('✅ [Auth] Usuário definido (dev token):', req.user);
      return next();
    }

    // Em desenvolvimento, se não há DATABASE_URL, usar dados do token
    if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
      console.log('🔧 [Auth] Modo desenvolvimento sem banco - usando dados do token');
      req.user = {
        id: userId,
        name: decoded.nome || 'Admin Dev',
        email: decoded.email || 'admin@segtrack.com.br',
        role: decoded.role as UserRole,
        permissions: decoded.permissions || []
      };
      console.log('✅ [Auth] Usuário definido (dev mode):', req.user);
      return next();
    }

    // Busca o usuário no banco de dados
    console.log('🔍 [Auth] Buscando usuário no banco...');
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
      console.log('❌ [Auth] Usuário não encontrado no banco');
      return sendResponse.unauthorized(res, 'Usuário não encontrado');
    }

    if (!user.active) {
      console.log('❌ [Auth] Usuário inativo');
      return sendResponse.unauthorized(res, 'Usuário inativo');
    }

    // Parse das permissões
    let permissions: string[];
    try {
      permissions = typeof user.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user.permissions || [];
      
      if (!Array.isArray(permissions)) {
        permissions = [];
      }
    } catch (error) {
      console.error('❌ [Auth] Erro ao fazer parse das permissões:', error);
      permissions = [];
    }

    // Adiciona o usuário ao request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      permissions
    };

    console.log('✅ [Auth] Autenticação bem-sucedida:', {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      permissionsCount: req.user.permissions.length
    });
    console.log('🔎 [Auth] Permissões do usuário carregado:', req.user.permissions);

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('❌ [Auth] Erro JWT:', error.message);
      return sendResponse.unauthorized(res, 'Token inválido ou expirado');
    }
    
    console.error('❌ [Auth] Erro na autenticação:', error);
    return sendResponse.error(res, error as Error);
  }
}

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