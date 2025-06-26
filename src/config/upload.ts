import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const uploadConfig = {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads'),
    filename: (req, file, callback) => {
      const fileHash = crypto.randomBytes(16).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;
      callback(null, fileName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req: any, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Tipo de arquivo inválido.'));
    }
  }
};

export const upload = multer(uploadConfig); 