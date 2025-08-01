"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RastreamentoPublicoService = void 0;
const prisma_1 = require("../../lib/prisma");
const crypto_1 = __importDefault(require("crypto"));
class RastreamentoPublicoService {
    constructor() {
        this.initializeDb();
    }
    async initializeDb() {
        this.db = await (0, prisma_1.ensurePrisma)();
    }
    /**
     * Gera um hash único para rastreamento público
     */
    async gerarHashRastreamento(ocorrenciaId) {
        await this.initializeDb();
        // Gerar hash único
        const hash = crypto_1.default.randomBytes(16).toString('hex');
        // Verificar se a ocorrência existe
        const ocorrencia = await this.db.ocorrencia.findUnique({
            where: { id: ocorrenciaId }
        });
        if (!ocorrencia) {
            throw new Error('Ocorrência não encontrada');
        }
        // Atualizar ocorrência com o hash
        await this.db.ocorrencia.update({
            where: { id: ocorrenciaId },
            data: { hashRastreamento: hash }
        });
        console.log(`🔗 Hash de rastreamento gerado para ocorrência ${ocorrenciaId}: ${hash}`);
        return hash;
    }
    /**
     * Obtém dados de rastreamento público por hash
     */
    async obterDadosRastreamento(hash) {
        await this.initializeDb();
        const ocorrencia = await this.db.ocorrencia.findUnique({
            where: { hashRastreamento: hash },
            include: {
                fotos: true
            }
        });
        if (!ocorrencia) {
            throw new Error('Link de rastreamento inválido ou expirado');
        }
        // Verificar se o rastreamento está ativo (status em_andamento)
        if (ocorrencia.status !== 'em_andamento') {
            throw new Error('Rastreamento não está ativo para esta ocorrência');
        }
        // Buscar prestador se existir
        let prestador = null;
        if (ocorrencia.prestador) {
            prestador = await this.db.prestador.findFirst({
                where: { nome: ocorrencia.prestador }
            });
        }
        // Retornar dados mínimos necessários
        return {
            ocorrencia: {
                id: ocorrencia.id,
                tipo: ocorrencia.tipo,
                placa1: ocorrencia.placa1,
                modelo1: ocorrencia.modelo1,
                cor1: ocorrencia.cor1,
                cliente: ocorrencia.cliente,
                endereco: ocorrencia.endereco,
                cidade: ocorrencia.cidade,
                estado: ocorrencia.estado,
                status: ocorrencia.status,
                criado_em: ocorrencia.criado_em,
                inicio: ocorrencia.inicio,
                chegada: ocorrencia.chegada,
                termino: ocorrencia.termino
            },
            prestador: prestador ? {
                id: prestador.id,
                nome: prestador.nome,
                telefone: prestador.telefone,
                latitude: prestador.latitude,
                longitude: prestador.longitude
            } : null,
            rastreamentoAtivo: ocorrencia.status === 'em_andamento'
        };
    }
    /**
     * Gera URL pública de rastreamento
     */
    gerarUrlPublica(hash) {
        return `https://app.painelsegtrack.com.br/monitoramento/${hash}`;
    }
    /**
     * Verifica se o hash é válido
     */
    async validarHash(hash) {
        await this.initializeDb();
        const ocorrencia = await this.db.ocorrencia.findUnique({
            where: { hashRastreamento: hash }
        });
        return !!ocorrencia && ocorrencia.status === 'em_andamento';
    }
    /**
     * Remove hash de rastreamento (quando ocorrência é finalizada)
     */
    async removerHashRastreamento(ocorrenciaId) {
        await this.initializeDb();
        await this.db.ocorrencia.update({
            where: { id: ocorrenciaId },
            data: { hashRastreamento: null }
        });
        console.log(`🗑️ Hash de rastreamento removido da ocorrência ${ocorrenciaId}`);
    }
}
exports.RastreamentoPublicoService = RastreamentoPublicoService;
