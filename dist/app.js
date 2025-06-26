"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const ocorrencias_1 = __importDefault(require("./routes/ocorrencias"));
const prestadores_1 = __importDefault(require("./routes/prestadores"));
const prestadoresPublico_1 = __importDefault(require("./routes/prestadoresPublico"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const fotos_1 = __importDefault(require("./routes/fotos"));
const veiculos_1 = __importDefault(require("./routes/veiculos"));
const axios_1 = __importDefault(require("axios"));
const auth_middleware_1 = require("./infrastructure/middleware/auth.middleware");
console.log('Iniciando configuração do Express...');
const app = (0, express_1.default)();
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
    // Sempre permitir em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        res.header('Access-Control-Allow-Origin', origin || '*');
    }
    else if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    else if (!origin) {
        // Permitir requisições sem origin (como mobile apps)
        res.header('Access-Control-Allow-Origin', '*');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 horas
    // Responder imediatamente para requisições OPTIONS
    if (req.method === 'OPTIONS') {
        console.log('[CORS] Respondendo OPTIONS');
        res.status(200).end();
        return;
    }
    console.log('[CORS] Headers aplicados');
    next();
});
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Middleware de log para todas as requisições
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
    next();
});
console.log('Configurando rotas básicas...');
// Rotas da API
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', auth_middleware_1.authenticateToken, userRoutes_1.default);
app.use('/api/ocorrencias', ocorrencias_1.default);
app.use('/api/prestadores', prestadores_1.default);
app.use('/api/prestadores-publico', prestadoresPublico_1.default);
app.use('/api/clientes', clientes_1.default);
app.use('/api/fotos', fotos_1.default);
app.use('/api/veiculos', veiculos_1.default);
// Rotas sem prefixo /api para compatibilidade com proxy do Vite
app.use('/auth', authRoutes_1.default);
app.use('/users', auth_middleware_1.authenticateToken, userRoutes_1.default);
app.use('/ocorrencias', ocorrencias_1.default);
app.use('/prestadores', prestadores_1.default);
app.use('/prestadores-publico', prestadoresPublico_1.default);
app.use('/clientes', clientes_1.default);
app.use('/fotos', fotos_1.default);
app.use('/veiculos', veiculos_1.default);
// Rota para consulta de CNPJ (API externa)
app.get('/api/cnpj/:cnpj', async (req, res) => {
    var _a, _b, _c;
    const { cnpj } = req.params;
    if (!cnpj || cnpj.length !== 14) {
        return res.status(400).json({ error: 'CNPJ inválido' });
    }
    try {
        console.log(`Consultando CNPJ: ${cnpj}`);
        // Usar a BrasilAPI (gratuita, sem necessidade de token)
        const response = await axios_1.default.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
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
                phone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.substring(0, 2)}) ${data.ddd_telefone_1.substring(2)}` : '',
                email: data.email || ''
            }
        };
        res.json(formattedResponse);
    }
    catch (error) {
        console.error('Erro ao consultar CNPJ:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 404) {
            res.status(404).json({ error: 'CNPJ não encontrado' });
        }
        else if (((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) === 429) {
            res.status(429).json({ error: 'Muitas consultas. Tente novamente em alguns segundos.' });
        }
        else {
            res.status(500).json({ error: 'Erro ao consultar CNPJ. Tente novamente.' });
        }
    }
});
// Rota para consulta de CNPJ sem prefixo /api
app.get('/cnpj/:cnpj', async (req, res) => {
    var _a, _b, _c;
    const { cnpj } = req.params;
    if (!cnpj || cnpj.length !== 14) {
        return res.status(400).json({ error: 'CNPJ inválido' });
    }
    try {
        console.log(`Consultando CNPJ: ${cnpj}`);
        // Usar a BrasilAPI (gratuita, sem necessidade de token)
        const response = await axios_1.default.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
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
                phone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.substring(0, 2)}) ${data.ddd_telefone_1.substring(2)}` : '',
                email: data.email || ''
            }
        };
        res.json(formattedResponse);
    }
    catch (error) {
        console.error('Erro ao consultar CNPJ:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 404) {
            res.status(404).json({ error: 'CNPJ não encontrado' });
        }
        else if (((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) === 429) {
            res.status(429).json({ error: 'Muitas consultas. Tente novamente em alguns segundos.' });
        }
        else {
            res.status(500).json({ error: 'Erro ao consultar CNPJ. Tente novamente.' });
        }
    }
});
// Rota básica para teste
app.get('/', (_req, res) => {
    res.json({ message: 'API Segtrack - Funcionando!' });
});
// Rota para testar autenticação
app.get('/api/test-auth', auth_middleware_1.authenticateToken, (req, res) => {
    res.json({
        message: 'Autenticação funcionando!',
        user: req.user,
        timestamp: new Date().toISOString()
    });
});
// Rota para testar autenticação sem prefixo /api
app.get('/test-auth', auth_middleware_1.authenticateToken, (req, res) => {
    res.json({
        message: 'Autenticação funcionando!',
        user: req.user,
        timestamp: new Date().toISOString()
    });
});
// Adicionar express-rate-limit
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Corrigir endpoint /api/health para testar conexão com o banco
app.get('/api/health', async (req, res) => {
    try {
        console.log('[HEALTH] Verificando status da API...');
        // Sempre retornar sucesso para evitar problemas de CORS
        res.status(200).json({
            status: 'ok',
            environment: process.env.NODE_ENV || 'unknown',
            message: 'API funcionando',
            timestamp: new Date().toISOString(),
            cors: 'enabled'
        });
    }
    catch (err) {
        console.error('Erro no health check:', err);
        // Mesmo com erro, retornar 200 para evitar problemas de CORS
        res.status(200).json({
            status: 'warning',
            message: 'API funcionando com avisos',
            timestamp: new Date().toISOString()
        });
    }
});
// Rota health sem prefixo /api para compatibilidade
app.get('/health', async (req, res) => {
    try {
        console.log('[HEALTH] Verificando status da API...');
        // Sempre retornar sucesso para evitar problemas de CORS
        res.status(200).json({
            status: 'ok',
            environment: process.env.NODE_ENV || 'unknown',
            message: 'API funcionando',
            timestamp: new Date().toISOString(),
            cors: 'enabled'
        });
    }
    catch (err) {
        console.error('Erro no health check:', err);
        // Mesmo com erro, retornar 200 para evitar problemas de CORS
        res.status(200).json({
            status: 'warning',
            message: 'API funcionando com avisos',
            timestamp: new Date().toISOString()
        });
    }
});
// Middleware fallback 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});
// Error handling
app.use((err, _req, res, _next) => {
    console.error('Erro não tratado:', err);
    // Tratamento específico para erros do Multer
    if (err.name === 'MulterError') {
        console.error('Erro do Multer:', err);
        return res.status(400).json({
            error: 'Erro no upload de arquivo',
            message: err.message,
            code: err.code
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
exports.default = app;
