import { Request, Response } from 'express';
import prisma from '../lib/db';
import fs from 'fs';
import path from 'path';

export const deletarOcorrencia = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (isNaN(Number(id))) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    // Primeiro, buscar a ocorrência para obter as fotos
    const ocorrencia = await prisma.ocorrencia.findUnique({
      where: { id: Number(id) },
      include: { fotos: true }
    });

    if (!ocorrencia) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }

    // Deletar os arquivos físicos das fotos
    for (const foto of ocorrencia.fotos) {
      const caminhoFoto = path.join(__dirname, '../../', foto.url);
      if (fs.existsSync(caminhoFoto)) {
        fs.unlinkSync(caminhoFoto);
      }
    }

    // Deletar a ocorrência (isso também deletará as fotos devido ao onDelete: Cascade)
    await prisma.ocorrencia.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Ocorrência deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar ocorrência:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar ocorrência',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}; 