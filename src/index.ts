"use strict";
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { corsHandler } from './middleware/corsHandler';
import { corsConfig } from './config/cors.config';
import prisma, { testDatabaseConnection } from "./config/database";

import veiculosRoutes from "./routes/veiculos";
import clientesRoutes from "./routes/clientes";
import prestadoresRoutes from "./routes/prestadores";
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CORS deve ser o primeiro middleware
console.log('🔒 Configurando CORS...');
app.use(corsHandler);

// Log detalhado de todas as requisições
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📝 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('📋 Headers:', {
    origin: req.headers.origin,
    referer: req.headers.referer,
    'user-agent': req.headers['user-agent']
  });
  next();
});

// Middleware básico
app.use(express.json());

// Rota de teste CORS
app.get("/api/cors-test", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "CORS está funcionando!",
    origin: req.headers.origin || 'Sem origem',
    method: req.method,
    headers: req.headers
  });
});

// Middleware de verificação do banco
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/api/cors-test") return next();

  try {
    await prisma.$queryRaw`SELECT 1`;
    next();
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco:", error);
    return res.status(503).json({
      error: "Serviço indisponível",
      message: "Erro ao conectar com o banco de dados"
    });
  }
});

// Arquivos estáticos
app.use("/uploads", (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, "../uploads")));

app.use("/relatorios-pdf", (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, "../relatorios-pdf")));

// Rotas da API
app.use("/api/veiculos", veiculosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/prestadores", prestadoresRoutes);
app.use("/api/ocorrencias", ocorrenciasRoutes);
app.use("/api/relatorios", relatoriosRoutes);
app.use("/api/fotos", fotosRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/public/prestadores", prestadoresPublico);

// Status da API com informações CORS
app.get("/api", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "online",
      environment: process.env.NODE_ENV,
      database: "connected",
      cors: {
        allowedOrigins: corsConfig.origins,
        credentials: corsConfig.credentials,
        methods: corsConfig.methods,
        headers: corsConfig.headers
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(503).json({
      status: "degraded",
      environment: process.env.NODE_ENV,
      database: "disconnected",
      error: error.message,
      cors: {
        allowedOrigins: corsConfig.origins,
        credentials: corsConfig.credentials,
        methods: corsConfig.methods,
        headers: corsConfig.headers
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Tratamento global de erro
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Erro capturado:", err);

  if (err.message?.includes('não permitida')) {
    return res.status(403).json({
      error: "CORS Error",
      message: err.message,
      allowedOrigins: corsConfig.origins
    });
  }

  if (err.code?.startsWith("P")) {
    return res.status(500).json({
      error: "Erro no banco de dados",
      message: "Ocorreu um erro ao acessar o banco de dados",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }

  res.status(500).json({
    error: "Erro interno no servidor",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// Inicialização do servidor
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0'; // Cloud Run requer 0.0.0.0

// Função para iniciar o servidor de forma segura
async function startServer() {
  console.log('🔄 Iniciando processo de boot...');
  console.log('📝 Variáveis de ambiente:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- PORT:', PORT);
  console.log('- HOST:', HOST);
  console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'Não configurado');
  console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Configurado' : 'Não configurado');
  
  try {
    // 1. Primeiro testa a conexão com o banco
    console.log('📡 Testando conexão com o banco de dados...');
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      console.warn('⚠️ Não foi possível conectar ao banco de dados');
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ Falha ao conectar com o banco de dados em produção');
        // Em produção, vamos continuar mesmo sem banco para o health check funcionar
      }
    } else {
      console.log('✅ Conexão com o banco de dados estabelecida');
    }
    
    // 2. Inicia o servidor HTTP
    console.log('🌐 Iniciando servidor HTTP...');
    console.log(`🎯 Tentando escutar em ${HOST}:${PORT}`);
    
    return new Promise((resolve, reject) => {
      const server = app.listen(PORT, HOST, () => {
        console.log(`✅ Servidor escutando em ${HOST}:${PORT}`);
        resolve(server);
      });

      server.on('error', (error: any) => {
        console.error('❌ Erro no servidor:', error);
        reject(error);
      });

      // Configura graceful shutdown
      process.on('SIGTERM', () => {
        console.log('🛑 Recebido sinal SIGTERM - Iniciando shutdown graceful');
        server.close(async () => {
          console.log('👋 Servidor HTTP encerrado');
          await prisma.$disconnect();
          console.log('🔌 Conexão com banco de dados encerrada');
          process.exit(0);
        });
      });
    });
  } catch (error: any) {
    console.error('❌ Erro fatal durante inicialização:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}

// Inicia o servidor com tratamento de erros global
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// Inicia o servidor
console.log('🚀 Iniciando processo de boot...');
startServer()
  .then(() => console.log('✅ Inicialização completa!'))
  .catch(error => {
    console.error('❌ Falha na inicialização:', error);
    process.exit(1);
  });

export default app;
