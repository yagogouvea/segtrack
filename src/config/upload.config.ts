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
      const fileName = `${hash}-${file.originalname}`;
      callback(null, fileName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type.'));
    }
  }
}; 