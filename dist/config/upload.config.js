"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadConfig = void 0;
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const multer_1 = __importDefault(require("multer"));
exports.uploadConfig = {
    storage: multer_1.default.diskStorage({
        destination: path_1.default.resolve(__dirname, '..', '..', 'uploads'),
        filename: (_req, file, callback) => {
            const hash = crypto_1.default.randomBytes(6).toString('hex');
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const fileName = `${hash}-${Date.now()}${ext}`;
            callback(null, fileName);
        }
    }),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB - aumentado para ser mais flexível
        files: 5 // máximo de 5 arquivos por vez
    },
    fileFilter: (_req, file, callback) => {
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
        }
        else {
            callback(new Error(`Tipo de arquivo inválido. Tipos permitidos: ${allowedMimes.join(', ')}`));
        }
    }
};
