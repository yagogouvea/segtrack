import { Request, Response } from 'express';
import { ensurePrisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

export const deletarOcorrencia = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (isNaN(Number(id))) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  try {
    const db = await ensurePrisma();
    // Primeiro, buscar a ocorrência para obter as fotos
    const ocorrencia = await db.ocorrencia.findUnique({
      where: { id: Number(id) },
      include: { fotos: true }
    });

    if (!ocorrencia) {
      res.status(404).json({ error: 'Ocorrência não encontrada' });
      return;
    }

    // Deletar os arquivos físicos das fotos
    for (const foto of ocorrencia.fotos) {
      const caminhoFoto = path.join(__dirname, '../../', foto.url);
      if (fs.existsSync(caminhoFoto)) {
        fs.unlinkSync(caminhoFoto);
      }
    }

    // Deletar a ocorrência (isso também deletará as fotos devido ao onDelete: Cascade)
    await db.ocorrencia.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Ocorrência deletada com sucesso' });
  } catch (error: unknown) {
    console.error('Erro ao deletar ocorrência:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar ocorrência',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}; 