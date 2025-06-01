"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));

// Rotas
const clientes_1 = __importDefault(require("./routes/clientes"));

dotenv_1.default.config();

const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;

// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());

// Servir arquivos estáticos (ex: imagens)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));

// Rotas
app.use("/api/clientes", clientes_1.default);

// Inicialização
app.listen(Number(PORT), () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});
