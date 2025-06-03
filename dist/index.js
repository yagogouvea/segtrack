"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const corsHandler_1 = require("./middleware/corsHandler");
const cors_config_1 = require("./config/cors.config");
const database_1 = __importStar(require("./config/database"));
const veiculos_1 = __importDefault(require("./routes/veiculos"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const prestadores_1 = __importDefault(require("./routes/prestadores"));
const ocorrencias_1 = __importDefault(require("./routes/ocorrencias"));
const fotos_1 = __importDefault(require("./routes/fotos"));
const relatorios_1 = __importDefault(require("./routes/relatorios"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const prestadoresPublico_1 = __importDefault(require("./routes/prestadoresPublico"));
// Log inicial para debug da inicialização
console.log(`
🚀 Iniciando aplicação...
📝 NODE_ENV: ${process.env.NODE_ENV || 'não definido'}
📡 PORT: ${process.env.PORT || '8080 (padrão)'}
`);
// Carrega variáveis de ambiente ANTES de qualquer outra operação
if (process.env.NODE_ENV !== "production" && fs_1.default.existsSync(".env.local")) {
    console.log('📄 Carregando variáveis de .env.local');
    dotenv_1.default.config({ path: ".env.local" });
}
else {
    console.log('📄 Carregando variáveis de .env');
    dotenv_1.default.config();
}
// Criação do app Express
console.log('🔧 Configurando Express...');
const app = (0, express_1.default)();
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// CORS deve ser o primeiro middleware
console.log('🔒 Configurando CORS...');
app.use(corsHandler_1.corsHandler);
// Log detalhado de todas as requisições
app.use((req, res, next) => {
    console.log(`📝 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('📋 Headers:', {
        origin: req.headers.origin,
        referer: req.headers.referer,
        'user-agent': req.headers['user-agent']
    });
    next();
});
// Middleware básico
app.use(express_1.default.json());
// Rota de teste CORS
app.get("/api/cors-test", (req, res) => {
    res.json({
        status: "ok",
        message: "CORS está funcionando!",
        origin: req.headers.origin || 'Sem origem',
        method: req.method,
        headers: req.headers
    });
});
// Middleware de verificação do banco
app.use(async (req, res, next) => {
    if (req.path === "/api/cors-test")
        return next();
    try {
        await database_1.default.$queryRaw `SELECT 1`;
        next();
    }
    catch (error) {
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
}, express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use("/relatorios-pdf", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express_1.default.static(path_1.default.join(__dirname, "../relatorios-pdf")));
// Rotas da API
app.use("/api/veiculos", veiculos_1.default);
app.use("/api/clientes", clientes_1.default);
app.use("/api/prestadores", prestadores_1.default);
app.use("/api/ocorrencias", ocorrencias_1.default);
app.use("/api/relatorios", relatorios_1.default);
app.use("/api/fotos", fotos_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/public/prestadores", prestadoresPublico_1.default);
// Status da API com informações CORS
app.get("/api", async (_req, res) => {
    try {
        await database_1.default.$queryRaw `SELECT 1`;
        res.json({
            status: "online",
            environment: process.env.NODE_ENV,
            database: "connected",
            cors: {
                allowedOrigins: cors_config_1.corsConfig.origins,
                credentials: cors_config_1.corsConfig.credentials,
                methods: cors_config_1.corsConfig.methods,
                headers: cors_config_1.corsConfig.headers
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(503).json({
            status: "degraded",
            environment: process.env.NODE_ENV,
            database: "disconnected",
            error: error.message,
            cors: {
                allowedOrigins: cors_config_1.corsConfig.origins,
                credentials: cors_config_1.corsConfig.credentials,
                methods: cors_config_1.corsConfig.methods,
                headers: cors_config_1.corsConfig.headers
            },
            timestamp: new Date().toISOString()
        });
    }
});
// Tratamento global de erro
app.use((err, _req, res, _next) => {
    console.error("❌ Erro capturado:", err);
    if (err.message?.includes('não permitida')) {
        return res.status(403).json({
            error: "CORS Error",
            message: err.message,
            allowedOrigins: cors_config_1.corsConfig.origins
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
        const dbConnected = await (0, database_1.testDatabaseConnection)();
        if (!dbConnected) {
            console.warn('⚠️ Não foi possível conectar ao banco de dados');
            if (process.env.NODE_ENV === 'production') {
                console.error('❌ Falha ao conectar com o banco de dados em produção');
                // Em produção, vamos continuar mesmo sem banco para o health check funcionar
            }
        }
        else {
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
            server.on('error', (error) => {
                console.error('❌ Erro no servidor:', error);
                reject(error);
            });
            // Configura graceful shutdown
            process.on('SIGTERM', () => {
                console.log('🛑 Recebido sinal SIGTERM - Iniciando shutdown graceful');
                server.close(async () => {
                    console.log('👋 Servidor HTTP encerrado');
                    await database_1.default.$disconnect();
                    console.log('🔌 Conexão com banco de dados encerrada');
                    process.exit(0);
                });
            });
        });
    }
    catch (error) {
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
exports.default = app;
