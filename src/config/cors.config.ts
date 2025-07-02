import { CorsOptions } from 'cors';

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:8080',
      'https://app.painelsegtrack.com.br',
      'https://web-production-19090.up.railway.app'
    ];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (
      allowedOrigins.includes(origin) ||
      process.env.NODE_ENV === 'development'
    ) {
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