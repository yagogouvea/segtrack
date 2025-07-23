"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
// Função para obter coordenadas via geocodificação
async function getCoordinates(endereco, cidade, estado) {
    try {
        console.log('🔍 [getCoordinates-Publico] Iniciando geocodificação:', { endereco, cidade, estado });
        // Validar se temos os dados mínimos necessários
        if (!endereco || !cidade || !estado) {
            console.log('⚠️ [getCoordinates-Publico] Dados de endereço incompletos:', { endereco, cidade, estado });
            return { latitude: null, longitude: null };
        }
        // Normalizar endereço
        const enderecoLimpo = endereco
            .replace(/\([^)]*\)/g, '') // Remove parênteses e conteúdo
            .replace(/TESTE.*$/i, '') // Remove "TESTE" e tudo depois
            .replace(/\s+/g, ' ') // Remove espaços múltiplos
            .trim();
        const cidadeNormalizada = cidade.trim();
        const estadoNormalizado = estado.trim();
        // Criar variações do endereço
        const variacoes = [
            `${enderecoLimpo}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`,
            `${cidadeNormalizada}, ${estadoNormalizado}, Brasil`,
            `${enderecoLimpo.replace(/\d+/g, '').trim()}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`
        ];
        console.log('🔍 [getCoordinates-Publico] Tentando geocodificar com variações:', variacoes);
        // Tentar cada variação até encontrar coordenadas
        for (let i = 0; i < variacoes.length; i++) {
            const enderecoCompleto = variacoes[i];
            console.log(`📍 [getCoordinates-Publico] Tentativa ${i + 1}: ${enderecoCompleto}`);
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1&countrycodes=br`;
                console.log(`🌐 [getCoordinates-Publico] Fazendo requisição para: ${url}`);
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'SegTrack-App/1.0'
                    }
                });
                if (!response.ok) {
                    console.log(`⚠️ [getCoordinates-Publico] Resposta não OK: ${response.status} ${response.statusText}`);
                    continue;
                }
                const data = await response.json();
                console.log(`📋 [getCoordinates-Publico] Resposta da API:`, data);
                if (data && data.length > 0) {
                    const result = {
                        latitude: parseFloat(data[0].lat),
                        longitude: parseFloat(data[0].lon)
                    };
                    console.log(`✅ [getCoordinates-Publico] Coordenadas encontradas na tentativa ${i + 1}:`, result);
                    return result;
                }
                else {
                    console.log(`⚠️ [getCoordinates-Publico] Nenhum resultado encontrado para: ${enderecoCompleto}`);
                }
            }
            catch (fetchError) {
                console.error(`❌ [getCoordinates-Publico] Erro na tentativa ${i + 1}:`, fetchError);
            }
            // Aguardar um pouco entre tentativas para não sobrecarregar a API
            if (i < variacoes.length - 1) {
                console.log(`⏳ [getCoordinates-Publico] Aguardando 1 segundo antes da próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        console.log('⚠️ [getCoordinates-Publico] Nenhuma coordenada encontrada para nenhuma variação do endereço');
        return { latitude: null, longitude: null };
    }
    catch (error) {
        console.error('❌ [getCoordinates-Publico] Erro ao geocodificar endereço:', error);
        return { latitude: null, longitude: null };
    }
}
const router = express_1.default.Router();
// Rota de teste sem autenticação
router.get('/test', (req, res) => {
    console.log('[prestadoresPublico] Rota de teste acessada');
    res.json({ message: 'Rota de prestadores públicos funcionando!', timestamp: new Date().toISOString() });
});
// Cadastro público de prestadores
router.post('/', async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
    console.log('📥 Recebendo requisição de cadastro público');
    console.log('📥 Headers:', req.headers);
    console.log('📥 Body completo:', JSON.stringify(req.body, null, 2));
    console.log('📥 Content-Type:', req.get('Content-Type'));
    console.log('📥 Content-Length:', req.get('Content-Length'));
    const { nome, cpf, cod_nome, telefone, email, tipo_pix, chave_pix, cep, endereco, bairro, cidade, estado, funcoes, regioes, tipo_veiculo, veiculos, modelo_antena // <-- novo campo
     } = req.body;
    // Normalizar dados recebidos do frontend
    const normalizedData = {
        nome,
        cpf,
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
        modelo_antena,
        // Normalizar funções (aceitar tanto strings quanto objetos)
        funcoes: Array.isArray(funcoes)
            ? funcoes.map((f) => typeof f === 'string' ? f : f.funcao || f.nome || String(f))
            : [],
        // Normalizar regiões (aceitar tanto strings quanto objetos)
        regioes: Array.isArray(regioes)
            ? regioes.map((r) => typeof r === 'string' ? r : r.regiao || r.nome || String(r))
            : [],
        // Normalizar veículos (aceitar tanto tipo_veiculo quanto veiculos)
        tipo_veiculo: Array.isArray(tipo_veiculo)
            ? tipo_veiculo.map((t) => typeof t === 'string' ? t : t.tipo || t.nome || String(t))
            : Array.isArray(veiculos)
                ? veiculos.map((v) => typeof v === 'string' ? v : v.tipo || v.nome || String(v))
                : []
    };
    console.log('📝 Dados normalizados:', {
        nome: normalizedData.nome,
        funcoes: normalizedData.funcoes,
        regioes: normalizedData.regioes,
        tipo_veiculo: normalizedData.tipo_veiculo
    });
    // Validação de campos obrigatórios
    const camposObrigatorios = {
        nome: !!normalizedData.nome,
        cpf: !!normalizedData.cpf,
        cod_nome: !!normalizedData.cod_nome,
        telefone: !!normalizedData.telefone,
        email: !!normalizedData.email,
        tipo_pix: !!normalizedData.tipo_pix,
        chave_pix: !!normalizedData.chave_pix,
        cep: !!normalizedData.cep,
        funcoes: Array.isArray(normalizedData.funcoes) && normalizedData.funcoes.length > 0,
        regioes: Array.isArray(normalizedData.regioes) && normalizedData.regioes.length > 0,
        tipo_veiculo: Array.isArray(normalizedData.tipo_veiculo) && normalizedData.tipo_veiculo.length > 0
    };
    console.log('🔍 Verificação dos campos obrigatórios:', camposObrigatorios);
    console.log('🔍 Valores dos campos:', {
        nome: normalizedData.nome,
        cpf: normalizedData.cpf,
        cod_nome: normalizedData.cod_nome,
        telefone: normalizedData.telefone,
        email: normalizedData.email,
        tipo_pix: normalizedData.tipo_pix,
        chave_pix: normalizedData.chave_pix,
        cep: normalizedData.cep,
        funcoes: normalizedData.funcoes,
        regioes: normalizedData.regioes,
        tipo_veiculo: normalizedData.tipo_veiculo
    });
    if (!normalizedData.nome || !normalizedData.cpf || !normalizedData.cod_nome || !normalizedData.telefone || !normalizedData.email ||
        !normalizedData.tipo_pix || !normalizedData.chave_pix || !normalizedData.cep ||
        !((_a = normalizedData.funcoes) === null || _a === void 0 ? void 0 : _a.length) || !((_b = normalizedData.regioes) === null || _b === void 0 ? void 0 : _b.length) || !((_c = normalizedData.tipo_veiculo) === null || _c === void 0 ? void 0 : _c.length)) {
        console.log('❌ Campos obrigatórios faltando:', {
            temNome: !!normalizedData.nome,
            temCPF: !!normalizedData.cpf,
            temCodNome: !!normalizedData.cod_nome,
            temTelefone: !!normalizedData.telefone,
            temEmail: !!normalizedData.email,
            temTipoPix: !!normalizedData.tipo_pix,
            temChavePix: !!normalizedData.chave_pix,
            temCEP: !!normalizedData.cep,
            temFuncoes: !!((_d = normalizedData.funcoes) === null || _d === void 0 ? void 0 : _d.length),
            temRegioes: !!((_e = normalizedData.regioes) === null || _e === void 0 ? void 0 : _e.length),
            temTipoVeiculo: !!((_f = normalizedData.tipo_veiculo) === null || _f === void 0 ? void 0 : _f.length)
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
    if (!Array.isArray(normalizedData.funcoes) || normalizedData.funcoes.length === 0) {
        console.log('❌ Funções inválidas:', normalizedData.funcoes);
        res.status(400).json({
            error: 'Funções devem ser um array não vazio.',
            received: normalizedData.funcoes
        });
        return;
    }
    if (!Array.isArray(normalizedData.regioes) || normalizedData.regioes.length === 0) {
        console.log('❌ Regiões inválidas:', normalizedData.regioes);
        res.status(400).json({
            error: 'Regiões devem ser um array não vazio.',
            received: normalizedData.regioes
        });
        return;
    }
    if (!Array.isArray(normalizedData.tipo_veiculo) || normalizedData.tipo_veiculo.length === 0) {
        console.log('❌ Tipos de veículo inválidos:', normalizedData.tipo_veiculo);
        res.status(400).json({
            error: 'Tipos de veículo devem ser um array não vazio.',
            received: normalizedData.tipo_veiculo
        });
        return;
    }
    // Validação dos valores das funções
    const funcoesValidas = ['Pronta resposta', 'Apoio armado', 'Policial', 'Antenista', 'Drone'];
    const funcoesInvalidas = normalizedData.funcoes.filter(f => !funcoesValidas.includes(f));
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
    const tiposVeiculoInvalidos = normalizedData.tipo_veiculo.filter(t => !tiposVeiculoValidos.includes(t));
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
    const regioesInvalidas = normalizedData.regioes.filter(r => !r || r.trim().length < 2);
    if (regioesInvalidas.length > 0) {
        console.log('❌ Regiões inválidas encontradas:', regioesInvalidas);
        res.status(400).json({
            error: 'Regiões devem ter pelo menos 2 caracteres.',
            invalidRegions: regioesInvalidas
        });
        return;
    }
    // Validação das funções
    const funcoesVazias = normalizedData.funcoes.filter(f => !f || f.trim().length < 2);
    if (funcoesVazias.length > 0) {
        console.log('❌ Funções vazias encontradas:', funcoesVazias);
        res.status(400).json({
            error: 'Funções devem ter pelo menos 2 caracteres.',
            emptyFunctions: funcoesVazias
        });
        return;
    }
    // Validação dos tipos de veículo
    const tiposVeiculoVazios = normalizedData.tipo_veiculo.filter(t => !t || t.trim().length < 2);
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
            qtdFuncoes: normalizedData.funcoes.length,
            qtdRegioes: normalizedData.regioes.length,
            qtdVeiculos: normalizedData.tipo_veiculo.length,
            veiculos: normalizedData.tipo_veiculo.map((tipo) => ({ tipo }))
        });
        // Obter coordenadas automaticamente
        console.log('📍 [Cadastro Público] Chamando getCoordinates...');
        const coordinates = await getCoordinates(endereco, cidade, estado);
        console.log('📍 [Cadastro Público] Coordenadas obtidas:', coordinates);
        // Garantir que tipo_veiculo é um array
        const veiculosParaCriar = Array.isArray(normalizedData.tipo_veiculo) ?
            normalizedData.tipo_veiculo.map((tipo) => ({ tipo })) : [];
        const prestadorData = {
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
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            funcoes: {
                create: normalizedData.funcoes.map((funcao) => ({ funcao }))
            },
            regioes: {
                create: normalizedData.regioes.map((regiao) => ({ regiao }))
            },
            veiculos: {
                create: veiculosParaCriar
            }
        };
        console.log('💾 [Cadastro Público] Salvando prestador com dados:', {
            nome: prestadorData.nome,
            latitude: prestadorData.latitude,
            longitude: prestadorData.longitude,
            funcoesCount: prestadorData.funcoes.create.length,
            regioesCount: prestadorData.regioes.create.length,
            veiculosCount: prestadorData.veiculos.create.length
        });
        const novoPrestador = await db.prestador.create({
            data: prestadorData,
            include: {
                funcoes: true,
                regioes: true,
                veiculos: true
            }
        });
        console.log('✅ [Cadastro Público] Prestador criado com sucesso:', {
            id: novoPrestador.id,
            nome: novoPrestador.nome,
            latitude: novoPrestador.latitude,
            longitude: novoPrestador.longitude
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
            details: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)
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
                telefone: true,
                cidade: true,
                estado: true,
                bairro: true,
                latitude: true,
                longitude: true,
                funcoes: {
                    select: {
                        funcao: true
                    }
                },
                regioes: {
                    select: {
                        regiao: true
                    }
                }
            }
        });
        // Transform the response to include functions and regions in a flattened format
        const formattedPrestadores = prestadores.map((p) => (Object.assign(Object.assign({}, p), { funcoes: p.funcoes.map((f) => f.funcao), regioes: p.regioes.map((r) => r.regiao) })));
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
