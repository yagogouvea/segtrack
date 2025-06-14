"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const uploadConfig = {
    storage: multer_1.default.diskStorage({
        destination: path_1.default.resolve(__dirname, '..', '..', 'uploads'),
        filename: (req, file, callback) => {
            const fileHash = crypto_1.default.randomBytes(16).toString('hex');
            const fileName = `${fileHash}-${file.originalname}`;
            callback(null, fileName);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, callback) => {
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(new Error('Tipo de arquivo inválido.'));
        }
    }
};
exports.upload = (0, multer_1.default)(uploadConfig);
