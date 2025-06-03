"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Carrega variáveis de ambiente
dotenv_1.default.config();
// Função para parsear origens do .env
function parseOrigins(originsStr) {
    return originsStr ? originsStr.split(',').map(o => o.trim()) : [];
}
// Origens padrão para desenvolvimento
const DEFAULT_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://segtrack-frontend-2mhd.vercel.app',
    'https://segtrack123-459783979706.southamerica-east1.run.app'
];
// Configuração do CORS
exports.corsConfig = {
    // Origens permitidas: combina .env com padrões
    origins: [
        ...parseOrigins(process.env.ALLOWED_ORIGINS),
        ...(process.env.NODE_ENV === 'development' ? DEFAULT_ORIGINS : DEFAULT_ORIGINS)
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
    isOriginAllowed: (origin) => {
        if (!origin)
            return true; // Permite requisições sem origem (ex: Postman)
        const { origins, allowVercelSubdomains } = exports.corsConfig;
        // Verifica se a origem está na lista de permitidas
        if (origins.includes(origin))
            return true;
        // Verifica se é um subdomínio do Vercel
        if (allowVercelSubdomains && origin.endsWith('.vercel.app'))
            return true;
        // Verifica se é o domínio do Cloud Run
        if (origin.includes('run.app'))
            return true;
        return false;
    }
};
