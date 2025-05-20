import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import veiculosRouter from './routes/veiculos';
import clientesRouter from './routes/clientes';
import prestadoresRouter from './routes/prestadores';
import ocorrenciasRouter from './routes/ocorrencias';
import fotosRouter from './routes/fotos';
import relatoriosRouter from './routes/relatorios';
import userRouter from './routes/userRoutes';
import authRouter from './routes/authRoutes'; // ✅ correto


dotenv.config();

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Middleware para servir imagens e PDFs
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/relatorios-pdf', express.static(path.join(__dirname, '../relatorios-pdf')));

// Rotas principais
app.use('/api/veiculos', veiculosRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/prestadores', prestadoresRouter);
app.use('/api/ocorrencias', ocorrenciasRouter);
app.use('/api/ocorrencias', fotosRouter); // para GET/POST /ocorrencias/:id/fotos
app.use('/api/fotos', fotosRouter);       // para PUT/DELETE /fotos/:id
app.use('/api/relatorios', relatoriosRouter);
app.use('/api/users', userRouter);        // 👈 nova rota adicionada aqui
app.use('/api/auth', authRouter);

// Rota raiz para teste rápido
app.get('/', (_req, res) => {
  res.send('🚀 API SEGTRACK online');
});

// Inicialização
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
