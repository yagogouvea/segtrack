import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type ResourceType = 'users' | 'ocorrencias';
type ActionType = 'read' | 'create' | 'update' | 'delete';

interface UserPermissions {
  [key: string]: {
    [key: string]: boolean;
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
    console.log('Verificando permissões:', {
      requiredPermissions,
      userRole: req.user?.role,
      userPermissions: req.user?.permissions
    });

    if (!req.user) {
      console.log('Usuário não autenticado');
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const isAdmin = req.user.role === 'admin';
    
    if (isAdmin) {
      console.log('Usuário é admin, permissão concedida');
      return next();
    }

    // Verifica se o usuário tem todas as permissões necessárias
    const hasAllPermissions = requiredPermissions.every(permission => {
      const [resource, action] = permission.split(':');
      
      console.log('Verificando permissão específica:', {
        permission,
        resource,
        action,
        userHasPermission: req.user?.permissions?.[resource]?.[action]
      });

      // Verifica se o recurso e ação são válidos
      if (!resource || !action) {
        console.log('Recurso ou ação inválidos');
        return false;
      }

      // Verifica se o usuário tem a permissão específica
      return req.user?.permissions?.[resource]?.[action] || false;
    });

    if (hasAllPermissions) {
      console.log('Usuário tem todas as permissões necessárias');
      return next();
    }

    console.log('Permissão negada');
    return res.status(403).json({ message: 'Permissão negada' });
  };
}
