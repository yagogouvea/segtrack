import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedUser {
  id: string;
  role: string;
  permissions: string[];
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
    const userPerms = req.user?.permissions || [];
    const isAdmin = req.user?.role === 'admin';
    const hasPermission = requiredPermissions.some((perm) => userPerms.includes(perm));

    if (isAdmin || hasPermission) {
      return next();
    }

    return res.status(403).json({ message: 'Permissão negada' });
  };
}
