import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/db';


const router = express.Router();

// Define onde salvar os arquivos PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'relatorios-pdf/');
  },
  filename: (req, file, cb) => {
    const nomeArquivo = `relatorio-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage });

// 🔹 Upload do PDF gerado no frontend
router.post('/upload', upload.single('arquivo'), async (req, res) => {
  try {
   const { originalname, filename } = req.file as Express.Multer.File;
    const { ocorrenciaId, cliente, tipo, dataAcionamento } = req.body;

    if (!ocorrenciaId || !cliente || !tipo || !dataAcionamento) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const relatorioCriado = await prisma.relatorio.create({
      data: {
        ocorrenciaId: Number(ocorrenciaId),
        cliente,
        tipo,
        dataAcionamento: new Date(dataAcionamento),
        caminhoPdf: `relatorios-pdf/${filename}`
      }
    });

    res.status(201).json({ mensagem: 'Relatório salvo com sucesso!', relatorio: relatorioCriado });
  } catch (error) {
    console.error('Erro ao salvar relatório:', error);
    res.status(500).json({ error: 'Erro ao salvar relatório.' });
  }
});

export default router;
