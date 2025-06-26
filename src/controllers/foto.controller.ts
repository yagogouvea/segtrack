import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { FotoService } from '../core/services/foto.service';

export class FotoController {
  private service: FotoService;

  constructor() {
    this.service = new FotoService(prisma);
  }

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const fotos = await this.service.list();
      res.json(fotos);
    } catch (error) {
      console.error('Erro ao listar fotos:', error);
      res.status(500).json({ error: 'Erro ao listar fotos' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const foto = await this.service.findById(Number(id));
      
      if (!foto) {
        res.status(404).json({ error: 'Foto não encontrada' });
        return;
      }
      
      res.json(foto);
    } catch (error) {
      console.error('Erro ao buscar foto:', error);
      res.status(500).json({ error: 'Erro ao buscar foto' });
    }
  };

  upload = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('=== UPLOAD DEBUG ===');
      console.log('req.file:', req.file);
      console.log('req.body:', req.body);
      console.log('req.headers:', req.headers);
      console.log('===================');

      if (!req.file) {
        console.error('Nenhum arquivo enviado');
        res.status(400).json({ 
          error: 'Nenhum arquivo enviado',
          message: 'Certifique-se de enviar um arquivo de imagem válido'
        });
        return;
      }

      const { ocorrenciaId, legenda } = req.body;

      if (!ocorrenciaId) {
        console.error('ocorrenciaId não fornecido');
        res.status(400).json({ 
          error: 'ocorrenciaId é obrigatório',
          message: 'Forneça o ID da ocorrência para associar a foto'
        });
        return;
      }

      // Verificar se a ocorrência existe
      const ocorrencia = await prisma.ocorrencia.findUnique({
        where: { id: Number(ocorrenciaId) }
      });

      if (!ocorrencia) {
        console.error('Ocorrência não encontrada:', ocorrenciaId);
        res.status(404).json({ 
          error: 'Ocorrência não encontrada',
          message: 'A ocorrência especificada não existe'
        });
        return;
      }

      // Construir URL correta para o arquivo
      const fileName = req.file.filename;
      const url = `/uploads/${fileName}`;

      const foto = await this.service.upload({
        url,
        legenda: legenda || '',
        ocorrenciaId: Number(ocorrenciaId)
      });

      console.log('Foto criada com sucesso:', foto);

      res.status(201).json({
        success: true,
        data: foto,
        message: 'Foto enviada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      
      // Limpar arquivo em caso de erro
      if (req.file) {
        const fs = require('fs');
        const path = require('path');
        const filepath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
          console.log('Arquivo removido devido ao erro:', req.file.filename);
        }
      }

      res.status(500).json({ 
        error: 'Erro ao fazer upload da foto',
        message: 'Ocorreu um erro interno ao processar o upload',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      res.status(500).json({ error: 'Erro ao deletar foto' });
    }
  };
} 