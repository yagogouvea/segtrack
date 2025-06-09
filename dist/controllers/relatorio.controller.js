"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatorioController = void 0;
const prisma_1 = require("../lib/prisma");
const relatorio_service_1 = require("../core/services/relatorio.service");
class RelatorioController {
    constructor() {
        this.gerarRelatorioOcorrencias = async (req, res) => {
            try {
                const { dataInicio, dataFim } = req.query;
                const relatorio = await this.service.gerarRelatorioOcorrencias(dataInicio, dataFim);
                res.json(relatorio);
            }
            catch (error) {
                console.error('Erro ao gerar relatório de ocorrências:', error);
                res.status(500).json({ error: 'Erro ao gerar relatório de ocorrências' });
            }
        };
        this.gerarRelatorioPrestadores = async (req, res) => {
            try {
                const { dataInicio, dataFim } = req.query;
                const relatorio = await this.service.gerarRelatorioPrestadores(dataInicio, dataFim);
                res.json(relatorio);
            }
            catch (error) {
                console.error('Erro ao gerar relatório de prestadores:', error);
                res.status(500).json({ error: 'Erro ao gerar relatório de prestadores' });
            }
        };
        this.gerarRelatorioClientes = async (req, res) => {
            try {
                const { dataInicio, dataFim } = req.query;
                const relatorio = await this.service.gerarRelatorioClientes(dataInicio, dataFim);
                res.json(relatorio);
            }
            catch (error) {
                console.error('Erro ao gerar relatório de clientes:', error);
                res.status(500).json({ error: 'Erro ao gerar relatório de clientes' });
            }
        };
        this.gerarRelatorioFinanceiro = async (req, res) => {
            try {
                const { dataInicio, dataFim } = req.query;
                const relatorio = await this.service.gerarRelatorioFinanceiro(dataInicio, dataFim);
                res.json(relatorio);
            }
            catch (error) {
                console.error('Erro ao gerar relatório financeiro:', error);
                res.status(500).json({ error: 'Erro ao gerar relatório financeiro' });
            }
        };
        this.service = new relatorio_service_1.RelatorioService(prisma_1.prisma);
    }
}
exports.RelatorioController = RelatorioController;
