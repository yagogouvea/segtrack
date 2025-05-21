"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const veiculos_1 = __importDefault(require("./routes/veiculos"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const prestadores_1 = __importDefault(require("./routes/prestadores"));
const ocorrencias_1 = __importDefault(require("./routes/ocorrencias"));
const fotos_1 = __importDefault(require("./routes/fotos"));
const relatorios_1 = __importDefault(require("./routes/relatorios"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes")); // ✅ correto
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares globais
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Middleware para servir imagens e PDFs
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/relatorios-pdf', express_1.default.static(path_1.default.join(__dirname, '../relatorios-pdf')));
// Rotas principais
app.use('/api/veiculos', veiculos_1.default);
app.use('/api/clientes', clientes_1.default);
app.use('/api/prestadores', prestadores_1.default);
app.use('/api/ocorrencias', ocorrencias_1.default);
app.use('/api/ocorrencias', fotos_1.default); // para GET/POST /ocorrencias/:id/fotos
app.use('/api/fotos', fotos_1.default); // para PUT/DELETE /fotos/:id
app.use('/api/relatorios', relatorios_1.default);
app.use('/api/users', userRoutes_1.default); // 👈 nova rota adicionada aqui
app.use('/api/auth', authRoutes_1.default);
// Rota raiz para teste rápido
app.get('/', (_req, res) => {
    res.send('🚀 API SEGTRACK online');
});
// Inicialização
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});
