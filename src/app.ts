import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { testConnection } from './lib/prisma';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import ocorrenciasRouter from './routes/ocorrencias';
import prestadoresRouter from './routes/prestadores';
import prestadoresPublicoRouter from './routes/prestadoresPublico';
import clientesRouter from './routes/clientes';
import fotosRouter from './routes/fotos';
import veiculosRouter from './routes/veiculos';
import axios from 'axios';
import { authenticateToken } from './infrastructure/middleware/auth.middleware';

console.log('Iniciando configuração do Express...');

const app = express();

// Configuração de segurança
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// CORS simples e robusto - deve ser o primeiro middleware
app.use((req, res, next) => {
  console.log('[CORS] Origin recebido:', req.get('origin'));
  console.log('[CORS] Method:', req.method);
  
  const origin = req.get('origin');
  const allowedOrigins = [
    'https://painelsegtrack.com.br',
    'https://www.painelsegtrack.com.br',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ];
  
  if (process.env.NODE_ENV === 'development') {
    // Libera geral em desenvolvimento
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Responder imediatamente para requisições OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('[CORS] Respondendo OPTIONS');
    res.sendStatus(200);
    return;
  }
  
  console.log('[CORS] Headers aplicados');
  next();
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(express.json());

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware de log para todas as requisições
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
  next();
});

console.log('Configurando rotas básicas...');

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/ocorrencias', ocorrenciasRouter);
app.use('/api/prestadores', prestadoresRouter);
app.use('/api/prestadores-publico', prestadoresPublicoRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/fotos', fotosRouter);
app.use('/api/veiculos', veiculosRouter);

// Rotas sem prefixo /api para compatibilidade com proxy do Vite
app.use('/auth', authRoutes);
app.use('/users', authenticateToken, userRoutes);
app.use('/ocorrencias', ocorrenciasRouter);
app.use('/prestadores', prestadoresRouter);
app.use('/prestadores-publico', prestadoresPublicoRouter);
app.use('/clientes', clientesRouter);
app.use('/fotos', fotosRouter);
app.use('/veiculos', veiculosRouter);

// Rota para consulta de CNPJ (API externa)
app.get('/api/cnpj/:cnpj', async (req, res) => {
  const { cnpj } = req.params;
  
  if (!cnpj || cnpj.length !== 14) {
    return res.status(400).json({ error: 'CNPJ inválido' });
  }

  try {
    console.log(`Consultando CNPJ: ${cnpj}`);
    
    // Usar a BrasilAPI (gratuita, sem necessidade de token)
    const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'SegTrack-Sistema/1.0'
      }
    });

    const data = response.data;
    console.log('Resposta da BrasilAPI:', data);

    // Formatar resposta para o padrão esperado pelo frontend
    const formattedResponse = {
      company: {
        name: data.razao_social || data.nome_fantasia || '',
        fantasy_name: data.nome_fantasia || '',
        legal_nature: data.natureza_juridica || '',
        cnae_main: data.cnae_fiscal_descricao || '',
        situation: data.descricao_situacao_cadastral || '',
        registration_date: data.data_inicio_atividade || ''
      },
      address: {
        street: data.logradouro || '',
        number: data.numero || '',
        complement: data.complemento || '',
        district: data.bairro || '',
        city: data.municipio || '',
        state: data.uf || '',
        zip: data.cep || ''
      },
      contact: {
        phone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.substring(0,2)}) ${data.ddd_telefone_1.substring(2)}` : '',
        email: data.email || ''
      }
    };

    res.json(formattedResponse);
  } catch (error: any) {
    console.error('Erro ao consultar CNPJ:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'CNPJ não encontrado' });
    } else if (error.response?.status === 429) {
      res.status(429).json({ error: 'Muitas consultas. Tente novamente em alguns segundos.' });
    } else {
      res.status(500).json({ error: 'Erro ao consultar CNPJ. Tente novamente.' });
    }
  }
});

// Rota para consulta de CNPJ sem prefixo /api
app.get('/cnpj/:cnpj', async (req, res) => {
  const { cnpj } = req.params;
  
  if (!cnpj || cnpj.length !== 14) {
    return res.status(400).json({ error: 'CNPJ inválido' });
  }

  try {
    console.log(`Consultando CNPJ: ${cnpj}`);
    
    // Usar a BrasilAPI (gratuita, sem necessidade de token)
    const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'SegTrack-Sistema/1.0'
      }
    });

    const data = response.data;
    console.log('Resposta da BrasilAPI:', data);

    // Formatar resposta para o padrão esperado pelo frontend
    const formattedResponse = {
      company: {
        name: data.razao_social || data.nome_fantasia || '',
        fantasy_name: data.nome_fantasia || '',
        legal_nature: data.natureza_juridica || '',
        cnae_main: data.cnae_fiscal_descricao || '',
        situation: data.descricao_situacao_cadastral || '',
        registration_date: data.data_inicio_atividade || ''
      },
      address: {
        street: data.logradouro || '',
        number: data.numero || '',
        complement: data.complemento || '',
        district: data.bairro || '',
        city: data.municipio || '',
        state: data.uf || '',
        zip: data.cep || ''
      },
      contact: {
        phone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.substring(0,2)}) ${data.ddd_telefone_1.substring(2)}` : '',
        email: data.email || ''
      }
    };

    res.json(formattedResponse);
  } catch (error: any) {
    console.error('Erro ao consultar CNPJ:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'CNPJ não encontrado' });
    } else if (error.response?.status === 429) {
      res.status(429).json({ error: 'Muitas consultas. Tente novamente em alguns segundos.' });
    } else {
      res.status(500).json({ error: 'Erro ao consultar CNPJ. Tente novamente.' });
    }
  }
});

// Rota básica para teste
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API Segtrack - Funcionando!' });
});

// Rota para testar autenticação
app.get('/api/test-auth', authenticateToken, (req: Request, res: Response) => {
  res.json({ 
    message: 'Autenticação funcionando!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Rota para testar autenticação sem prefixo /api
app.get('/test-auth', authenticateToken, (req: Request, res: Response) => {
  res.json({ 
    message: 'Autenticação funcionando!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Adicionar express-rate-limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Corrigir endpoint /api/health para testar conexão com o banco
app.get('/api/health', async (req, res) => {
  try {
    // Em desenvolvimento, não testar conexão com banco
    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({ 
        status: 'ok',
        environment: 'development',
        message: 'API funcionando em modo desenvolvimento',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Em produção, testar conexão com banco
    if (process.env.DATABASE_URL) {
      await testConnection();
      res.status(200).json({ 
        status: 'ok',
        environment: 'production',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(200).json({ 
        status: 'ok',
        environment: 'production',
        message: 'API funcionando (sem banco de dados)',
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Erro no health check:', err);
    res.status(500).json({ 
      status: 'erro', 
      detalhes: (err instanceof Error ? err.message : String(err)),
      timestamp: new Date().toISOString()
    });
  }
});

// Rota health sem prefixo /api para compatibilidade
app.get('/health', async (req, res) => {
  try {
    // Em desenvolvimento, não testar conexão com banco
    if (process.env.NODE_ENV === 'development') {
      res.status(200).json({ 
        status: 'ok',
        environment: 'development',
        message: 'API funcionando em modo desenvolvimento',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // Em produção, testar conexão com banco
    if (process.env.DATABASE_URL) {
      await testConnection();
      res.status(200).json({ 
        status: 'ok',
        environment: 'production',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(200).json({ 
        status: 'ok',
        environment: 'production',
        message: 'API funcionando (sem banco de dados)',
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Erro no health check:', err);
    res.status(500).json({ 
      status: 'erro', 
      detalhes: (err instanceof Error ? err.message : String(err)),
      timestamp: new Date().toISOString()
    });
  }
});

// Middleware fallback 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro não tratado:', err);
  
  // Tratamento específico para erros do Multer
  if (err.name === 'MulterError') {
    console.error('Erro do Multer:', err);
    return res.status(400).json({
      error: 'Erro no upload de arquivo',
      message: err.message,
      code: (err as any).code
    });
  }
  
  // Tratamento para erros de tipo de arquivo
  if (err.message.includes('Tipo de arquivo inválido')) {
    return res.status(400).json({
      error: 'Tipo de arquivo não permitido',
      message: err.message
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

console.log('Configuração do Express concluída!');

export default app; 