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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Erro ao buscar foto:', error);
      res.status(500).json({ error: 'Erro ao buscar foto' });
    }
  };

  getByOcorrencia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ocorrenciaId } = req.params;
      const fotos = await this.service.findByOcorrencia(Number(ocorrenciaId));
      res.json(fotos);
    } catch (error: unknown) {
      console.error('Erro ao buscar fotos da ocorrência:', error);
      res.status(500).json({ error: 'Erro ao buscar fotos da ocorrência' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { legenda, cropX, cropY, zoom, cropArea } = req.body;

      console.log('📸 Atualizando foto:', {
        id,
        legenda,
        cropX,
        cropY,
        zoom,
        cropArea: typeof cropArea
      });

      // Permitir legenda vazia ou null, mas deve ser string se fornecida
      if (legenda !== undefined && legenda !== null && typeof legenda !== 'string') {
        res.status(400).json({ error: 'Legenda deve ser uma string.' });
        return;
      }

      const updateData: any = { 
        legenda: legenda || '' // Garantir que legenda seja sempre string
      };

      // Adicionar campos de crop e zoom se fornecidos
      if (cropX !== undefined) updateData.cropX = parseFloat(cropX);
      if (cropY !== undefined) updateData.cropY = parseFloat(cropY);
      if (zoom !== undefined) updateData.zoom = parseFloat(zoom);
      if (cropArea !== undefined) {
        try {
          updateData.cropArea = typeof cropArea === 'string' ? JSON.parse(cropArea) : cropArea;
          console.log('✅ cropArea parseado com sucesso:', updateData.cropArea);
        } catch (e) {
          console.warn('❌ Erro ao parsear cropArea:', e);
        }
      }

      console.log('💾 Dados para atualização:', updateData);

      const fotoAtualizada = await this.service.update(Number(id), updateData);
      console.log('✅ Foto atualizada:', fotoAtualizada);
      res.json(fotoAtualizada);
    } catch (error: unknown) {
      console.error('❌ Erro ao atualizar foto:', error);
      res.status(500).json({ error: 'Erro ao atualizar foto.', detalhes: String(error) });
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
    } catch (error: unknown) {
      console.error('Erro ao fazer upload da foto:', error);
      res.status(500).json({ error: 'Erro ao fazer upload da foto' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(Number(id));
      res.status(204).send();
    } catch (error: unknown) {
      console.error('Erro ao deletar foto:', error);
      res.status(500).json({ error: 'Erro ao deletar foto' });
    }
  };
} 