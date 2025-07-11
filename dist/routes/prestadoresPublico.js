"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Rota de teste sem autenticação
router.get('/test', (req, res) => {
    console.log('[prestadoresPublico] Rota de teste acessada');
    res.json({ message: 'Rota de prestadores públicos funcionando!', timestamp: new Date().toISOString() });
});
// Cadastro público de prestadores
router.post('/', async (req, res) => {
    console.log('📥 Recebendo requisição de cadastro público');
    console.log('📥 Headers:', req.headers);
    console.log('📥 Body completo:', JSON.stringify(req.body, null, 2));
    console.log('📥 Content-Type:', req.get('Content-Type'));
    console.log('📥 Content-Length:', req.get('Content-Length'));
    const { nome, cpf, cod_nome, telefone, email, tipo_pix, chave_pix, cep, endereco, bairro, cidade, estado, funcoes, regioes, tipo_veiculo, modelo_antena // <-- novo campo
     } = req.body;
    // Validação de campos obrigatórios
    const camposObrigatorios = {
        nome: !!nome,
        cpf: !!cpf,
        cod_nome: !!cod_nome,
        telefone: !!telefone,
        email: !!email,
        tipo_pix: !!tipo_pix,
        chave_pix: !!chave_pix,
        cep: !!cep,
        funcoes: Array.isArray(funcoes) && funcoes.length > 0,
        regioes: Array.isArray(regioes) && regioes.length > 0,
        tipo_veiculo: Array.isArray(tipo_veiculo) && tipo_veiculo.length > 0
    };
    console.log('🔍 Verificação dos campos obrigatórios:', camposObrigatorios);
    console.log('🔍 Valores dos campos:', {
        nome: nome,
        cpf: cpf,
        cod_nome: cod_nome,
        telefone: telefone,
        email: email,
        tipo_pix: tipo_pix,
        chave_pix: chave_pix,
        cep: cep,
        funcoes: funcoes,
        regioes: regioes,
        tipo_veiculo: tipo_veiculo
    });
    if (!nome || !cpf || !cod_nome || !telefone || !email ||
        !tipo_pix || !chave_pix || !cep ||
        !(funcoes === null || funcoes === void 0 ? void 0 : funcoes.length) || !(regioes === null || regioes === void 0 ? void 0 : regioes.length) || !(tipo_veiculo === null || tipo_veiculo === void 0 ? void 0 : tipo_veiculo.length)) {
        console.log('❌ Campos obrigatórios faltando:', {
            temNome: !!nome,
            temCPF: !!cpf,
            temCodNome: !!cod_nome,
            temTelefone: !!telefone,
            temEmail: !!email,
            temTipoPix: !!tipo_pix,
            temChavePix: !!chave_pix,
            temCEP: !!cep,
            temFuncoes: !!(funcoes === null || funcoes === void 0 ? void 0 : funcoes.length),
            temRegioes: !!(regioes === null || regioes === void 0 ? void 0 : regioes.length),
            temTipoVeiculo: !!(tipo_veiculo === null || tipo_veiculo === void 0 ? void 0 : tipo_veiculo.length)
        });
        res.status(400).json({
            error: 'Campos obrigatórios ausentes.',
            details: camposObrigatorios,
            missingFields: Object.entries(camposObrigatorios)
                .filter(([_, value]) => !value)
                .map(([key, _]) => key)
        });
        return;
    }
    // Validação específica para tipo_pix
    const tiposPixValidos = ['cpf', 'email', 'telefone', 'chave_aleatoria'];
    if (!tiposPixValidos.includes(tipo_pix)) {
        console.log('❌ Tipo PIX inválido:', tipo_pix);
        res.status(400).json({
            error: 'Tipo PIX inválido.',
            validTypes: tiposPixValidos,
            receivedType: tipo_pix
        });
        return;
    }
    // Validação específica para arrays
    if (!Array.isArray(funcoes) || funcoes.length === 0) {
        console.log('❌ Funções inválidas:', funcoes);
        res.status(400).json({
            error: 'Funções devem ser um array não vazio.',
            received: funcoes
        });
        return;
    }
    if (!Array.isArray(regioes) || regioes.length === 0) {
        console.log('❌ Regiões inválidas:', regioes);
        res.status(400).json({
            error: 'Regiões devem ser um array não vazio.',
            received: regioes
        });
        return;
    }
    if (!Array.isArray(tipo_veiculo) || tipo_veiculo.length === 0) {
        console.log('❌ Tipos de veículo inválidos:', tipo_veiculo);
        res.status(400).json({
            error: 'Tipos de veículo devem ser um array não vazio.',
            received: tipo_veiculo
        });
        return;
    }
    // Validação dos valores das funções
    const funcoesValidas = ['Pronta resposta', 'Apoio armado', 'Policial', 'Antenista', 'Drone'];
    const funcoesInvalidas = funcoes.filter(f => !funcoesValidas.includes(f));
    if (funcoesInvalidas.length > 0) {
        console.log('❌ Funções inválidas encontradas:', funcoesInvalidas);
        res.status(400).json({
            error: 'Funções inválidas encontradas.',
            validFunctions: funcoesValidas,
            invalidFunctions: funcoesInvalidas
        });
        return;
    }
    // Validação dos valores dos tipos de veículo
    const tiposVeiculoValidos = ['Carro', 'Moto'];
    const tiposVeiculoInvalidos = tipo_veiculo.filter(t => !tiposVeiculoValidos.includes(t));
    if (tiposVeiculoInvalidos.length > 0) {
        console.log('❌ Tipos de veículo inválidos encontrados:', tiposVeiculoInvalidos);
        res.status(400).json({
            error: 'Tipos de veículo inválidos encontrados.',
            validTypes: tiposVeiculoValidos,
            invalidTypes: tiposVeiculoInvalidos
        });
        return;
    }
    // Validação de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.log('❌ Email inválido:', email);
        res.status(400).json({
            error: 'Formato de email inválido.',
            receivedEmail: email
        });
        return;
    }
    // Validação de CPF (deve ter 11 dígitos)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
        console.log('❌ CPF inválido:', cpf);
        res.status(400).json({
            error: 'CPF deve ter 11 dígitos.',
            receivedCPF: cpf,
            cleanCPF: cpfLimpo,
            length: cpfLimpo.length
        });
        return;
    }
    // Validação de CEP (deve ter 8 dígitos)
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
        console.log('❌ CEP inválido:', cep);
        res.status(400).json({
            error: 'CEP deve ter 8 dígitos.',
            receivedCEP: cep,
            cleanCEP: cepLimpo,
            length: cepLimpo.length
        });
        return;
    }
    // Validação de telefone (deve ter pelo menos 10 dígitos)
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10) {
        console.log('❌ Telefone inválido:', telefone);
        res.status(400).json({
            error: 'Telefone deve ter pelo menos 10 dígitos.',
            receivedTelefone: telefone,
            cleanTelefone: telefoneLimpo,
            length: telefoneLimpo.length
        });
        return;
    }
    // Validação de estado (deve ter 2 letras)
    if (!estado || estado.length !== 2) {
        console.log('❌ Estado inválido:', estado);
        res.status(400).json({
            error: 'Estado deve ter 2 letras (ex: SP).',
            receivedEstado: estado
        });
        return;
    }
    // Validação da chave PIX baseada no tipo
    if (tipo_pix === 'cpf') {
        const chavePixLimpa = chave_pix.replace(/\D/g, '');
        if (chavePixLimpa.length !== 11) {
            console.log('❌ Chave PIX CPF inválida:', chave_pix);
            res.status(400).json({
                error: 'Chave PIX CPF deve ter 11 dígitos.',
                receivedChavePix: chave_pix,
                cleanChavePix: chavePixLimpa,
                length: chavePixLimpa.length
            });
            return;
        }
    }
    else if (tipo_pix === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(chave_pix)) {
            console.log('❌ Chave PIX email inválida:', chave_pix);
            res.status(400).json({
                error: 'Chave PIX email deve ter formato válido.',
                receivedChavePix: chave_pix
            });
            return;
        }
    }
    else if (tipo_pix === 'telefone') {
        const chavePixLimpa = chave_pix.replace(/\D/g, '');
        if (chavePixLimpa.length < 10) {
            console.log('❌ Chave PIX telefone inválida:', chave_pix);
            res.status(400).json({
                error: 'Chave PIX telefone deve ter pelo menos 10 dígitos.',
                receivedChavePix: chave_pix,
                cleanChavePix: chavePixLimpa,
                length: chavePixLimpa.length
            });
            return;
        }
    }
    else if (tipo_pix === 'chave_aleatoria') {
        if (!chave_pix || chave_pix.length < 5) {
            console.log('❌ Chave PIX aleatória inválida:', chave_pix);
            res.status(400).json({
                error: 'Chave PIX aleatória deve ter pelo menos 5 caracteres.',
                receivedChavePix: chave_pix
            });
            return;
        }
    }
    // Validação dos campos de endereço
    if (!endereco || !bairro || !cidade) {
        console.log('❌ Campos de endereço incompletos:', { endereco, bairro, cidade });
        res.status(400).json({
            error: 'Campos de endereço são obrigatórios.',
            missingFields: {
                endereco: !endereco,
                bairro: !bairro,
                cidade: !cidade
            }
        });
        return;
    }
    // Validação do codinome
    if (!cod_nome || cod_nome.trim().length < 2) {
        console.log('❌ Codinome inválido:', cod_nome);
        res.status(400).json({
            error: 'Codinome deve ter pelo menos 2 caracteres.',
            receivedCodNome: cod_nome
        });
        return;
    }
    // Validação do nome
    if (!nome || nome.trim().length < 3) {
        console.log('❌ Nome inválido:', nome);
        res.status(400).json({
            error: 'Nome deve ter pelo menos 3 caracteres.',
            receivedNome: nome
        });
        return;
    }
    // Validação das regiões
    const regioesInvalidas = regioes.filter(r => !r || r.trim().length < 2);
    if (regioesInvalidas.length > 0) {
        console.log('❌ Regiões inválidas encontradas:', regioesInvalidas);
        res.status(400).json({
            error: 'Regiões devem ter pelo menos 2 caracteres.',
            invalidRegions: regioesInvalidas
        });
        return;
    }
    // Validação das funções
    const funcoesVazias = funcoes.filter(f => !f || f.trim().length < 2);
    if (funcoesVazias.length > 0) {
        console.log('❌ Funções vazias encontradas:', funcoesVazias);
        res.status(400).json({
            error: 'Funções devem ter pelo menos 2 caracteres.',
            emptyFunctions: funcoesVazias
        });
        return;
    }
    // Validação dos tipos de veículo
    const tiposVeiculoVazios = tipo_veiculo.filter(t => !t || t.trim().length < 2);
    if (tiposVeiculoVazios.length > 0) {
        console.log('❌ Tipos de veículo vazios encontrados:', tiposVeiculoVazios);
        res.status(400).json({
            error: 'Tipos de veículo devem ter pelo menos 2 caracteres.',
            emptyVehicleTypes: tiposVeiculoVazios
        });
        return;
    }
    console.log('✅ Todas as validações passaram com sucesso!');
    try {
        const db = await (0, prisma_1.ensurePrisma)();
        // Verificar se já existe um prestador com este CPF
        const existente = await db.prestador.findFirst({
            where: { cpf: cpf.replace(/\D/g, '') }
        });
        if (existente) {
            console.log('❌ CPF já cadastrado:', cpf);
            res.status(400).json({ error: 'Já existe um prestador cadastrado com este CPF.' });
            return;
        }
        console.log('Criando prestador com os dados:', {
            nome, cpf, cod_nome, telefone, email,
            tipo_pix, chave_pix, cep,
            qtdFuncoes: funcoes.length,
            qtdRegioes: regioes.length,
            qtdVeiculos: tipo_veiculo.length,
            veiculos: tipo_veiculo.map((tipo) => ({ tipo }))
        });
        // Garantir que tipo_veiculo é um array
        const veiculosParaCriar = Array.isArray(tipo_veiculo) ?
            tipo_veiculo.map((tipo) => ({ tipo })) : [];
        const novoPrestador = await db.prestador.create({
            data: {
                nome,
                cpf: cpf.replace(/\D/g, ''),
                cod_nome,
                telefone,
                email,
                tipo_pix,
                chave_pix,
                cep,
                endereco,
                bairro,
                cidade,
                estado,
                origem: 'cadastro_publico',
                aprovado: false,
                valor_acionamento: 0,
                valor_hora_adc: 0,
                valor_km_adc: 0,
                franquia_km: 0,
                franquia_horas: '',
                modelo_antena, // <-- novo campo
                funcoes: {
                    create: funcoes.map((funcao) => ({ funcao }))
                },
                regioes: {
                    create: regioes.map((regiao) => ({ regiao }))
                },
                veiculos: {
                    create: veiculosParaCriar
                }
            },
            include: {
                funcoes: true,
                regioes: true,
                veiculos: true
            }
        });
        // Formatar a resposta para incluir tipo_veiculo
        const prestadorFormatado = Object.assign(Object.assign({}, novoPrestador), { funcoes: novoPrestador.funcoes.map((f) => f.funcao), regioes: novoPrestador.regioes.map((r) => r.regiao), tipo_veiculo: novoPrestador.veiculos.map((v) => v.tipo), veiculos: novoPrestador.veiculos });
        console.log('Prestador criado com sucesso:', prestadorFormatado);
        res.status(201).json(prestadorFormatado);
    }
    catch (error) {
        console.error('Erro ao cadastrar prestador público:', error);
        res.status(500).json({
            error: 'Erro ao processar o cadastro.',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});
// Listar prestadores públicos
router.get('/', async (_req, res) => {
    try {
        const db = await (0, prisma_1.ensurePrisma)();
        const prestadores = await db.prestador.findMany({
            where: { aprovado: true },
            select: {
                id: true,
                nome: true,
                cidade: true,
                estado: true,
                funcoes: {
                    select: {
                        funcao: true
                    }
                }
            }
        });
        // Transform the response to include functions in a flattened format
        const formattedPrestadores = prestadores.map((p) => (Object.assign(Object.assign({}, p), { funcoes: p.funcoes.map((f) => f.funcao) })));
        res.json(formattedPrestadores);
    }
    catch (error) {
        console.error('Erro ao buscar prestadores:', error);
        res.status(500).json({ error: 'Erro ao buscar prestadores' });
    }
});
// Buscar prestador público por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, prisma_1.ensurePrisma)();
        const prestador = await db.prestador.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                nome: true,
                cidade: true,
                estado: true,
                funcoes: {
                    select: {
                        funcao: true
                    }
                },
                aprovado: true
            }
        });
        if (!prestador) {
            res.status(404).json({ error: 'Prestador não encontrado' });
            return;
        }
        // Transform the response to include functions in a flattened format
        const formattedPrestador = Object.assign(Object.assign({}, prestador), { funcoes: prestador.funcoes.map((f) => f.funcao) });
        res.json(formattedPrestador);
    }
    catch (error) {
        console.error('Erro ao buscar prestador:', error);
        res.status(500).json({ error: 'Erro ao buscar prestador' });
    }
});
exports.default = router;
