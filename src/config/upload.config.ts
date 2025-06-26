import { Options } from 'multer';
import { Request } from 'express';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

export const uploadConfig: Options = {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads'),
    filename: (_req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
      const hash = crypto.randomBytes(6).toString('hex');
      const ext = path.extname(file.originalname).toLowerCase();
      const fileName = `${hash}-${Date.now()}${ext}`;
      callback(null, fileName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB - aumentado para ser mais flexível
    files: 5 // máximo de 5 arquivos por vez
  },
  fileFilter: (_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/pjpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error(`Tipo de arquivo inválido. Tipos permitidos: ${allowedMimes.join(', ')}`));
    }
  }
}; 