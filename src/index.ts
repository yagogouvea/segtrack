"use strict";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import veiculosRoutes from "./routes/veiculos";
import clientesRoutes from "./routes/clientes";
import prestadoresRoutes from "./routes/prestadores";
import ocorrenciasRoutes from "./routes/ocorrencias";
import fotosRoutes from "./routes/fotos";
import relatoriosRoutes from "./routes/relatorios";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";

// Carrega .env.local em ambiente de desenvolvimento, .env ou variáveis externas em produção
if (process.env.NODE_ENV !== "production" && fs.existsSync(".env.local")) {
    dotenv.config({ path: ".env.local" });
} else {
    dotenv.config();
}

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Middleware para servir imagens e PDFs
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/relatorios-pdf', express.static(path.join(__dirname, '../relatorios-pdf')));

// Rotas principais
app.use('/api/veiculos', veiculosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/prestadores', prestadoresRoutes);
app.use('/api/ocorrencias', ocorrenciasRoutes);
app.use('/api/ocorrencias', fotosRoutes); // para GET/POST /ocorrencias/:id/fotos
app.use('/api/fotos', fotosRoutes); // para PUT/DELETE /fotos/:id
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Rota raiz para teste rápido
app.get('/', (_req, res) => {
    res.send('🚀 API SEGTRACK online');
});

// Inicialização
const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
