import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPermissions {
  users?: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  ocorrencias?: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

interface DecodedUser {
  id: string;
  role: string;
  name: string;
  permissions: UserPermissions;
}

// Estendendo o tipo Request para incluir `req.user`
declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

// ✅ Exporta como função nomeada
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido ou expirado' });
  }
}

// ✅ Exporta como função nomeada
export function checkPermissions(requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const isAdmin = req.user.role === 'admin';
    
    if (isAdmin) {
      return next();
    }

    // Verifica se o usuário tem todas as permissões necessárias
    const hasAllPermissions = requiredPermissions.every(permission => {
      const [resource, action] = permission.split(':');
      
      // Verifica se o recurso e ação são válidos
      if (!resource || !action) {
        return false;
      }

      // Verifica se o usuário tem a permissão específica
      return req.user?.permissions?.[resource]?.[action] || false;
    });

    if (hasAllPermissions) {
      return next();
    }

    return res.status(403).json({ message: 'Permissão negada' });
  };
}
