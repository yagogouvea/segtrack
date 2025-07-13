import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { RelatorioService } from '../core/services/relatorio.service';

export class RelatorioController {
  private service: RelatorioService;

  constructor() {
    this.service = new RelatorioService(prisma);
  }

  gerarRelatorioOcorrencias = async (req: Request, res: Response) => {
    try {
      const { dataInicio, dataFim } = req.query;
      const relatorio = await this.service.gerarRelatorioOcorrencias(
        dataInicio as string,
        dataFim as string
      );
      res.json(relatorio);
    } catch (error: unknown) {
      console.error('Erro ao gerar relatório de ocorrências:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório de ocorrências' });
    }
  };

  gerarRelatorioPrestadores = async (req: Request, res: Response) => {
    try {
      const { dataInicio, dataFim } = req.query;
      const relatorio = await this.service.gerarRelatorioPrestadores(
        dataInicio as string,
        dataFim as string
      );
      res.json(relatorio);
    } catch (error: unknown) {
      console.error('Erro ao gerar relatório de prestadores:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório de prestadores' });
    }
  };

  gerarRelatorioClientes = async (req: Request, res: Response) => {
    try {
      const { dataInicio, dataFim } = req.query;
      const relatorio = await this.service.gerarRelatorioClientes(
        dataInicio as string,
        dataFim as string
      );
      res.json(relatorio);
    } catch (error: unknown) {
      console.error('Erro ao gerar relatório de clientes:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório de clientes' });
    }
  };

  gerarRelatorioFinanceiro = async (req: Request, res: Response) => {
    try {
      const { dataInicio, dataFim } = req.query;
      const relatorio = await this.service.gerarRelatorioFinanceiro(
        dataInicio as string,
        dataFim as string
      );
      res.json(relatorio);
    } catch (error: unknown) {
      console.error('Erro ao gerar relatório financeiro:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório financeiro' });
    }
  };
} 