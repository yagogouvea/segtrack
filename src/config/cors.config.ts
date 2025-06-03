import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Função para parsear origens do .env
function parseOrigins(originsStr?: string): string[] {
  return originsStr ? originsStr.split(',').map(o => o.trim()) : [];
}

// Origens padrão para desenvolvimento
const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://segtrack.comerceoficial.com'
];

// Adiciona a URL do frontend se estiver definida
if (process.env.FRONTEND_URL) {
  DEFAULT_ORIGINS.push(process.env.FRONTEND_URL);
}

// Configuração do CORS
export const corsConfig = {
  // Origens permitidas: combina .env com padrões
  origins: [
    ...parseOrigins(process.env.ALLOWED_ORIGINS),
    ...DEFAULT_ORIGINS
  ],

  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Headers permitidos
  headers: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],

  // Tempo de cache do preflight em segundos (24 horas)
  maxAge: 86400,

  // Sempre permitir subdomínios .vercel.app em produção
  allowVercelSubdomains: true,

  // Permitir credenciais (cookies, auth headers)
  credentials: true,

  // Função para validar origem
  isOriginAllowed: (origin: string | undefined): boolean => {
    if (!origin) return true; // Permite requisições sem origem (ex: Postman)
    
    const { origins, allowVercelSubdomains } = corsConfig;
    
    // Verifica se a origem está na lista de permitidas
    if (origins.includes(origin)) return true;
    
    // Verifica se é um subdomínio do Vercel
    if (allowVercelSubdomains && origin.endsWith('.vercel.app')) return true;
    
    // Verifica se é o domínio do frontend
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return true;
    
    return false;
  }
}; 