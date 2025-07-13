import { Request, Response } from 'express';
import { PrestadorService } from '../core/services/prestador.service';

export class PrestadorController {
  private service: PrestadorService;

  constructor() {
    this.service = new PrestadorService();
  }

  listPublic = async (_req: Request, res: Response): Promise<void> => {
    try {
      const prestadores = await this.service.listPublic();
      res.json(prestadores);
    } catch (error) {
      console.error('Erro ao listar prestadores públicos:', error);
      res.status(500).json({ error: 'Erro ao listar prestadores públicos' });
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nome, cod_nome, regioes, funcoes, local, page = 1, pageSize = 20 } = req.query;
      
      const filters = {
        nome: nome ? String(nome) : undefined,
        cod_nome: cod_nome ? String(cod_nome) : undefined,
        regioes: regioes ? String(regioes).split(',') : undefined,
        funcoes: funcoes ? String(funcoes).split(',') : undefined,
        local: local ? String(local) : undefined,
      };
      
      const pagination = {
        page: Number(page),
        pageSize: Number(pageSize)
      };
      
      const result = await this.service.list(filters, pagination);
      res.json(result);
    } catch (error) {
      console.error('Erro ao listar prestadores:', error);
      res.status(500).json({ error: 'Erro ao listar prestadores' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const prestador = await this.service.findById(Number(id));
      
      if (!prestador) {
        res.status(404).json({ error: 'Prestador não encontrado' });
        return;
      }
      
      res.json(prestador);
    } catch (error) {
      console.error('Erro ao buscar prestador:', error);
      res.status(500).json({ error: 'Erro ao buscar prestador' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const prestador = await this.service.create(req.body);
      res.status(201).json(prestador);
    } catch (error) {
      console.error('Erro ao criar prestador:', error);
      res.status(500).json({ error: 'Erro ao criar prestador' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log('🔍 Atualizando prestador ID:', id);
      console.log('📝 Dados recebidos:', {
        id: req.params.id,
        bodyKeys: Object.keys(req.body),
        bodySample: {
          nome: req.body.nome,
          cpf: req.body.cpf,
          funcoes: req.body.funcoes?.length,
          veiculos: req.body.veiculos?.length,
          regioes: req.body.regioes?.length
        }
      });
      
      const prestador = await this.service.update(Number(id), req.body);
      
      if (!prestador) {
        console.log('❌ Prestador não encontrado após atualização');
        res.status(404).json({ error: 'Prestador não encontrado' });
        return;
      }
      
      console.log('✅ Prestador atualizado com sucesso:', {
        id: prestador.id,
        nome: prestador.nome
      });
      
      res.json(prestador);
    } catch (error: any) {
      console.error('❌ Erro detalhado ao atualizar prestador:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      });
      
      let errorMessage = 'Erro ao atualizar prestador';
      let statusCode = 500;
      
      if (error.message.includes('não encontrado')) {
        statusCode = 404;
        errorMessage = error.message;
      } else if (error.message.includes('CPF')) {
        statusCode = 400;
        errorMessage = error.message;
      }
      
      res.status(statusCode).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(Number(id));
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar prestador:', error);
      res.status(500).json({ error: 'Erro ao deletar prestador' });
    }
  };

  mapa = async (req: Request, res: Response): Promise<void> => {
    try {
      const prestadores = await this.service.listMapa();
      res.json(prestadores);
    } catch (error) {
      console.error('Erro ao listar prestadores para o mapa:', error);
      res.status(500).json({ error: 'Erro ao listar prestadores para o mapa' });
    }
  };
} 