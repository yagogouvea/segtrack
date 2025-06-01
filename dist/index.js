"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./config/database"));
const veiculos_1 = __importDefault(require("./routes/veiculos"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const prestadores_1 = __importDefault(require("./routes/prestadores"));
const ocorrencias_1 = __importDefault(require("./routes/ocorrencias"));
const fotos_1 = __importDefault(require("./routes/fotos"));
const relatorios_1 = __importDefault(require("./routes/relatorios"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const prestadoresPublico_1 = __importDefault(require("./routes/prestadoresPublico"));
// Carrega variáveis de ambiente
if (process.env.NODE_ENV !== "production" && fs_1.default.existsSync(".env.local")) {
    dotenv_1.default.config({ path: ".env.local" });
}
else {
    dotenv_1.default.config();
}
const app = (0, express_1.default)();
// Configuração CORS aprimorada com log
const allowedOrigins = [
    "https://segtrack-frontend-2mhd.vercel.app",
    "http://localhost:5173"
];
const corsOptions = {
    origin: (origin, callback) => {
        console.log("🌐 Requisição com origem:", origin);
        if (!origin || allowedOrigins.includes(origin) || origin?.endsWith(".vercel.app")) {
            callback(null, true);
        }
        else {
            console.warn("❌ Origin bloqueada por CORS:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400,
    preflightContinue: true,
    optionsSuccessStatus: 204
};
// Aplicar CORS antes de tudo
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)(corsOptions));
// Log de todas as requisições
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log("Request Headers:", req.headers);
    next();
});
// Middleware básico
app.use(express_1.default.json());
// Rota de teste
app.get("/api/test", (_req, res) => {
    res.json({ status: "ok", message: "🚀 API SEGTRACK funcionando!" });
});
// Middleware de verificação do banco
app.use(async (req, res, next) => {
    if (req.path === "/api/test")
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
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use("/relatorios-pdf", express_1.default.static(path_1.default.join(__dirname, "../relatorios-pdf")));
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
// Status da API
app.get("/api", async (_req, res) => {
    try {
        await database_1.default.$queryRaw `SELECT 1`;
        res.json({
            status: "online",
            environment: process.env.NODE_ENV,
            database: "connected",
            cors: {
                allowedOrigins,
                credentials: true
            }
        });
    }
    catch (error) {
        res.json({
            status: "online",
            environment: process.env.NODE_ENV,
            database: "disconnected",
            error: error.message,
            cors: {
                allowedOrigins,
                credentials: true
            }
        });
    }
});
// Tratamento global de erro
app.use((err, _req, res, _next) => {
    console.error("❌ Erro capturado:", err);
    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            error: "Acesso não permitido",
            message: "Esta origem não tem permissão para acessar a API"
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
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, async () => {
    console.log(`✅ Servidor rodando em ${HOST}:${PORT}`);
    console.log("Variáveis de ambiente:");
    console.log("- NODE_ENV:", process.env.NODE_ENV);
    console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "Configurado" : "Não configurado");
    console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "Configurado" : "Não configurado");
    try {
        await database_1.default.$queryRaw `SELECT 1`;
        console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");
    }
    catch (error) {
        console.error("❌ AVISO: Servidor iniciado mas sem conexão com o banco de dados");
        console.error(error);
    }
});
