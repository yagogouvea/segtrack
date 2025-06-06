"use strict";
import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import cors from 'cors';
import corsOptions from './config/cors.config';

import veiculosRoutes from "./routes/veiculos";
import clientesRoutes from "./routes/clientes";
import ocorrenciasRoutes from "./routes/ocorrencias";
import fotosRoutes from "./routes/fotos";
import relatoriosRoutes from "./routes/relatorios";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import prestadoresPublico from "./routes/prestadoresPublico";

// Log inicial para debug da inicialização
console.log(`
🚀 Iniciando aplicação...
📝 NODE_ENV: ${process.env.NODE_ENV || 'não definido'}
📡 PORT: ${process.env.PORT || '8080 (padrão)'}
`);

// Carrega variáveis de ambiente ANTES de qualquer outra operação
if (process.env.NODE_ENV !== "production" && fs.existsSync(".env.local")) {
  console.log('📄 Carregando variáveis de .env.local');
  dotenv.config({ path: ".env.local" });
} else {
  console.log('📄 Carregando variáveis de .env');
  dotenv.config();
}

// Criação do app Express
console.log('🔧 Configurando Express...');
const app = express();

// Aplicar CORS antes de qualquer middleware ou rota
app.use(cors(corsOptions));

// Log de todas as requisições
app.use((_req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${_req.method} ${_req.url}`);
  if (process.env.NODE_ENV === 'development') {
    console.log('Request Headers:', _req.headers);
    console.log('Origin:', _req.headers.origin);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint para verificar CORS
app.get('/', (_req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'API is running',
    cors: 'enabled',
    timestamp: new Date().toISOString()
  });
});

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar rotas
app.use('/api/veiculos', veiculosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/ocorrencias', ocorrenciasRoutes);
app.use('/api/fotos', fotosRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/prestadores-publico', prestadoresPublico);

// Servir arquivos estáticos do diretório de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`
🚀 Servidor rodando na porta ${PORT}
📝 Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}
  `);
});

export default app;
