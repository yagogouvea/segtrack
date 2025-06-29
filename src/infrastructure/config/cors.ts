import { CorsOptions } from 'cors';

const allowedOrigins = [
  'https://painelsegtrack.com.br',
  'https://api.painelsegtrack.com.br',
  'https://segtrack-frontend-production-fe95.up.railway.app'
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 horas
};

export default corsOptions; 