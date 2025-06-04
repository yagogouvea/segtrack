import cors from 'cors';
import { CorsOptions } from 'cors';

const allowedOrigins = [
  'https://segtrack.comerceoficial.com',
  'https://www.segtrack.comerceoficial.com',
  'http://localhost:3000',  // Para desenvolvimento local
  'http://localhost:5173',  // Para servidor Vite
  'http://localhost:8080'   // Para desenvolvimento local adicional
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem origem (como apps mobile ou requisições curl)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`Origem ${origin} não permitida por CORS`);
      callback(new Error('Não permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400 // 24 horas
};

export default corsOptions; 