import cors from 'cors';
import { CorsOptions } from 'cors';

const allowedOrigins = [
  'https://segtrack.comerceoficial.com',
  'http://localhost:3000',  // For local development
  'http://localhost:5173'   // For Vite development server
];

const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  maxAge: 86400 // 24 hours
};

export default corsOptions; 