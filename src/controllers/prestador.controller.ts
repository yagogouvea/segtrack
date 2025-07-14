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
    } catch (error: unknown) {
      console.error('Erro ao listar prestadores públicos:', error);
      res.status(500).json({ error: 'Erro ao listar prestadores públicos' });
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nome, cod_nome, regioes, funcoes, local, sem_valores, page = 1, pageSize = 20 } = req.query;
      
      const filters = {
        nome: nome ? String(nome) : undefined,
        cod_nome: cod_nome ? String(cod_nome) : undefined,
        regioes: regioes ? String(regioes).split(',') : undefined,
        funcoes: funcoes ? String(funcoes).split(',') : undefined,
        local: local ? String(local) : undefined,
        sem_valores: sem_valores === 'true',
      };
      
      const pagination = {
        page: Number(page),
        pageSize: Number(pageSize)
      };
      
      const result = await this.service.list(filters, pagination);
      res.json(result);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Erro ao buscar prestador:', error);
      res.status(500).json({ error: 'Erro ao buscar prestador' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const prestador = await this.service.create(req.body);
      res.status(201).json(prestador);
    } catch (error: unknown) {
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
        valor_acionamento: req.body.valor_acionamento,
        valor_hora_adc: req.body.valor_hora_adc,
        valor_km_adc: req.body.valor_km_adc,
        franquia_km: req.body.franquia_km,
        bodySample: {
          nome: req.body.nome,
          cpf: req.body.cpf,
          funcoes: req.body.funcoes?.length,
          veiculos: req.body.veiculos?.length,
          regioes: req.body.regioes?.length
        }
      });
      
      // Normalizar dados recebidos do frontend
      const normalizedData = {
        ...req.body,
        // Converter arrays de strings para arrays de objetos se necessário
        funcoes: Array.isArray(req.body.funcoes) 
          ? req.body.funcoes.map((f: any) => typeof f === 'string' ? { funcao: f } : f)
          : req.body.funcoes,
        veiculos: Array.isArray(req.body.veiculos)
          ? req.body.veiculos.map((v: any) => typeof v === 'string' ? { tipo: v } : v)
          : req.body.veiculos,
        regioes: Array.isArray(req.body.regioes)
          ? req.body.regioes.map((r: any) => typeof r === 'string' ? { regiao: r } : r)
          : req.body.regioes,
        // Converter valores numéricos se necessário
        valor_acionamento: typeof req.body.valor_acionamento === 'string' 
          ? parseFloat(req.body.valor_acionamento) 
          : req.body.valor_acionamento,
        valor_hora_adc: typeof req.body.valor_hora_adc === 'string'
          ? parseFloat(req.body.valor_hora_adc)
          : req.body.valor_hora_adc,
        valor_km_adc: typeof req.body.valor_km_adc === 'string'
          ? parseFloat(req.body.valor_km_adc)
          : req.body.valor_km_adc,
        franquia_km: typeof req.body.franquia_km === 'string'
          ? parseFloat(req.body.franquia_km)
          : req.body.franquia_km,
        aprovado: typeof req.body.aprovado === 'string'
          ? req.body.aprovado === 'true'
          : req.body.aprovado
      };
      
      console.log('📝 Dados normalizados:', {
        nome: normalizedData.nome,
        valor_acionamento: normalizedData.valor_acionamento,
        valor_hora_adc: normalizedData.valor_hora_adc,
        valor_km_adc: normalizedData.valor_km_adc,
        franquia_km: normalizedData.franquia_km,
        funcoes: normalizedData.funcoes?.length,
        veiculos: normalizedData.veiculos?.length,
        regioes: normalizedData.regioes?.length,
        aprovado: normalizedData.aprovado
      });

      // Tratar valores undefined como null para o banco
      const dadosParaSalvar = {
        ...normalizedData,
        valor_acionamento: normalizedData.valor_acionamento ?? null,
        valor_hora_adc: normalizedData.valor_hora_adc ?? null,
        valor_km_adc: normalizedData.valor_km_adc ?? null,
        franquia_km: normalizedData.franquia_km ?? null
      };
      
      console.log('📝 Dados para salvar:', {
        nome: dadosParaSalvar.nome,
        valor_acionamento: dadosParaSalvar.valor_acionamento,
        valor_hora_adc: dadosParaSalvar.valor_hora_adc,
        valor_km_adc: dadosParaSalvar.valor_km_adc,
        franquia_km: dadosParaSalvar.franquia_km,
        funcoes: dadosParaSalvar.funcoes?.length,
        veiculos: dadosParaSalvar.veiculos?.length,
        regioes: dadosParaSalvar.regioes?.length,
        aprovado: dadosParaSalvar.aprovado
      });
      
      const prestador = await this.service.update(Number(id), dadosParaSalvar);
      
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
    } catch (error: unknown) {
      console.error('❌ Erro detalhado ao atualizar prestador:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        code: (error as any)?.code
      });
      
      let errorMessage = 'Erro ao atualizar prestador';
      let statusCode = 500;
      
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      if (errorMsg.includes('não encontrado')) {
        statusCode = 404;
        errorMessage = errorMsg;
      } else if (errorMsg.includes('CPF')) {
        statusCode = 400;
        errorMessage = errorMsg;
      }
      
      res.status(statusCode).json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorMsg : undefined
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.service.delete(Number(id));
      res.status(204).send();
    } catch (error: unknown) {
      console.error('Erro ao deletar prestador:', error);
      res.status(500).json({ error: 'Erro ao deletar prestador' });
    }
  };

  mapa = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🔍 [PrestadorController.mapa] Iniciando listagem de prestadores para o mapa');
      const prestadores = await this.service.listMapa();
      console.log('✅ [PrestadorController.mapa] Prestadores retornados:', Array.isArray(prestadores) ? prestadores.length : prestadores);
      res.json(prestadores);
    } catch (error: unknown) {
      console.error('❌ [PrestadorController.mapa] Erro ao listar prestadores para o mapa:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        code: (error as any)?.code
      });
      res.status(500).json({ error: 'Erro ao listar prestadores para o mapa', details: error instanceof Error ? error.message : String(error) });
    }
  };
} 