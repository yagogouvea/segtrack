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
      if (!req.file) {
        res.status(400).json({ error: 'Nenhum arquivo enviado' });
        return;
      }

      console.log('Arquivo salvo:', req.file.path);

      const foto = await this.service.upload({
        url: req.file.path,
        legenda: req.body.legenda || '',
        ocorrenciaId: Number(req.body.ocorrenciaId)
      });

      res.status(201).json(foto);
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      res.status(500).json({ error: 'Erro ao fazer upload da foto' });
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