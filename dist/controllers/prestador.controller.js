"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrestadorController = void 0;
const prestador_service_1 = require("../core/services/prestador.service");
class PrestadorController {
    constructor() {
        this.listPublic = async (_req, res) => {
            try {
                const prestadores = await this.service.listPublic();
                res.json(prestadores);
            }
            catch (error) {
                console.error('Erro ao listar prestadores públicos:', error);
                res.status(500).json({ error: 'Erro ao listar prestadores públicos' });
            }
        };
        this.list = async (req, res) => {
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
            }
            catch (error) {
                console.error('Erro ao listar prestadores:', error);
                res.status(500).json({ error: 'Erro ao listar prestadores' });
            }
        };
        this.getById = async (req, res) => {
            try {
                const { id } = req.params;
                const prestador = await this.service.findById(Number(id));
                if (!prestador) {
                    res.status(404).json({ error: 'Prestador não encontrado' });
                    return;
                }
                res.json(prestador);
            }
            catch (error) {
                console.error('Erro ao buscar prestador:', error);
                res.status(500).json({ error: 'Erro ao buscar prestador' });
            }
        };
        this.create = async (req, res) => {
            try {
                const prestador = await this.service.create(req.body);
                res.status(201).json(prestador);
            }
            catch (error) {
                console.error('Erro ao criar prestador:', error);
                res.status(500).json({ error: 'Erro ao criar prestador' });
            }
        };
        this.update = async (req, res) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
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
                        funcoes: (_a = req.body.funcoes) === null || _a === void 0 ? void 0 : _a.length,
                        veiculos: (_b = req.body.veiculos) === null || _b === void 0 ? void 0 : _b.length,
                        regioes: (_c = req.body.regioes) === null || _c === void 0 ? void 0 : _c.length
                    }
                });
                // Normalizar dados recebidos do frontend
                const normalizedData = Object.assign(Object.assign({}, req.body), { 
                    // Converter arrays de strings para arrays de objetos se necessário
                    funcoes: Array.isArray(req.body.funcoes)
                        ? req.body.funcoes.map((f) => typeof f === 'string' ? { funcao: f } : f)
                        : req.body.funcoes, veiculos: Array.isArray(req.body.veiculos)
                        ? req.body.veiculos.map((v) => typeof v === 'string' ? { tipo: v } : v)
                        : req.body.veiculos, regioes: Array.isArray(req.body.regioes)
                        ? req.body.regioes.map((r) => typeof r === 'string' ? { regiao: r } : r)
                        : req.body.regioes, 
                    // Converter valores numéricos se necessário
                    valor_acionamento: typeof req.body.valor_acionamento === 'string'
                        ? parseFloat(req.body.valor_acionamento)
                        : req.body.valor_acionamento, valor_hora_adc: typeof req.body.valor_hora_adc === 'string'
                        ? parseFloat(req.body.valor_hora_adc)
                        : req.body.valor_hora_adc, valor_km_adc: typeof req.body.valor_km_adc === 'string'
                        ? parseFloat(req.body.valor_km_adc)
                        : req.body.valor_km_adc, franquia_km: typeof req.body.franquia_km === 'string'
                        ? parseFloat(req.body.franquia_km)
                        : req.body.franquia_km, aprovado: typeof req.body.aprovado === 'string'
                        ? req.body.aprovado === 'true'
                        : req.body.aprovado });
                console.log('📝 Dados normalizados:', {
                    nome: normalizedData.nome,
                    valor_acionamento: normalizedData.valor_acionamento,
                    valor_hora_adc: normalizedData.valor_hora_adc,
                    valor_km_adc: normalizedData.valor_km_adc,
                    franquia_km: normalizedData.franquia_km,
                    funcoes: (_d = normalizedData.funcoes) === null || _d === void 0 ? void 0 : _d.length,
                    veiculos: (_e = normalizedData.veiculos) === null || _e === void 0 ? void 0 : _e.length,
                    regioes: (_f = normalizedData.regioes) === null || _f === void 0 ? void 0 : _f.length,
                    aprovado: normalizedData.aprovado
                });
                // Tratar valores undefined como null para o banco
                const dadosParaSalvar = Object.assign(Object.assign({}, normalizedData), { valor_acionamento: (_g = normalizedData.valor_acionamento) !== null && _g !== void 0 ? _g : null, valor_hora_adc: (_h = normalizedData.valor_hora_adc) !== null && _h !== void 0 ? _h : null, valor_km_adc: (_j = normalizedData.valor_km_adc) !== null && _j !== void 0 ? _j : null, franquia_km: (_k = normalizedData.franquia_km) !== null && _k !== void 0 ? _k : null });
                console.log('📝 Dados para salvar:', {
                    nome: dadosParaSalvar.nome,
                    valor_acionamento: dadosParaSalvar.valor_acionamento,
                    valor_hora_adc: dadosParaSalvar.valor_hora_adc,
                    valor_km_adc: dadosParaSalvar.valor_km_adc,
                    franquia_km: dadosParaSalvar.franquia_km,
                    funcoes: (_l = dadosParaSalvar.funcoes) === null || _l === void 0 ? void 0 : _l.length,
                    veiculos: (_m = dadosParaSalvar.veiculos) === null || _m === void 0 ? void 0 : _m.length,
                    regioes: (_o = dadosParaSalvar.regioes) === null || _o === void 0 ? void 0 : _o.length,
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
            }
            catch (error) {
                console.error('❌ Erro detalhado ao atualizar prestador:', {
                    message: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    name: error instanceof Error ? error.name : undefined,
                    code: error === null || error === void 0 ? void 0 : error.code
                });
                let errorMessage = 'Erro ao atualizar prestador';
                let statusCode = 500;
                const errorMsg = error instanceof Error ? error.message : String(error);
                if (errorMsg.includes('não encontrado')) {
                    statusCode = 404;
                    errorMessage = errorMsg;
                }
                else if (errorMsg.includes('CPF')) {
                    statusCode = 400;
                    errorMessage = errorMsg;
                }
                res.status(statusCode).json({
                    error: errorMessage,
                    details: process.env.NODE_ENV === 'development' ? errorMsg : undefined
                });
            }
        };
        this.delete = async (req, res) => {
            try {
                const { id } = req.params;
                await this.service.delete(Number(id));
                res.status(204).send();
            }
            catch (error) {
                console.error('Erro ao deletar prestador:', error);
                res.status(500).json({ error: 'Erro ao deletar prestador' });
            }
        };
        this.mapa = async (req, res) => {
            try {
                console.log('🔍 [PrestadorController.mapa] Iniciando listagem de prestadores para o mapa');
                const prestadores = await this.service.listMapa();
                console.log('✅ [PrestadorController.mapa] Prestadores retornados:', Array.isArray(prestadores) ? prestadores.length : prestadores);
                res.json(prestadores);
            }
            catch (error) {
                console.error('❌ [PrestadorController.mapa] Erro ao listar prestadores para o mapa:', {
                    message: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined,
                    name: error instanceof Error ? error.name : undefined,
                    code: error === null || error === void 0 ? void 0 : error.code
                });
                res.status(500).json({ error: 'Erro ao listar prestadores para o mapa', details: error instanceof Error ? error.message : String(error) });
            }
        };
        this.service = new prestador_service_1.PrestadorService();
    }
}
exports.PrestadorController = PrestadorController;
