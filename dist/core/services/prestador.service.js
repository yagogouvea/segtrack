"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrestadorService = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../../errors/AppError");
const prisma_1 = require("../../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Função utilitária para normalizar texto (remover acentos e converter para minúsculas)
function normalizarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .toLowerCase()
        .trim();
}
// Função para normalizar e limpar endereços
function normalizarEndereco(endereco, cidade, estado, bairro) {
    console.log('🔧 [normalizarEndereco] Iniciando normalização:', { endereco, cidade, estado, bairro });
    // Limpar endereço
    let enderecoLimpo = endereco
        .replace(/\([^)]*\)/g, '') // Remove parênteses e conteúdo
        .replace(/TESTE.*$/i, '') // Remove "TESTE" e tudo depois
        .replace(/\s+/g, ' ') // Remove espaços múltiplos
        .trim();
    // Normalizar cidade e estado
    const cidadeNormalizada = cidade.trim();
    const estadoNormalizado = estado.trim();
    const bairroNormalizado = bairro ? bairro.trim() : '';
    console.log('🔧 [normalizarEndereco] Dados normalizados:', {
        enderecoLimpo,
        cidadeNormalizada,
        estadoNormalizado,
        bairroNormalizado
    });
    // Criar variações do endereço
    const variacoes = [];
    // Variação 1: Endereço completo com bairro (mais específico)
    if (bairroNormalizado && bairroNormalizado.length > 2) {
        const variacao1 = `${enderecoLimpo}, ${bairroNormalizado}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`;
        variacoes.push(variacao1);
        console.log('🔧 [normalizarEndereco] Variação 1 (com bairro):', variacao1);
    }
    // Variação 2: Endereço sem bairro
    const variacao2 = `${enderecoLimpo}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`;
    variacoes.push(variacao2);
    console.log('🔧 [normalizarEndereco] Variação 2 (sem bairro):', variacao2);
    // Variação 3: Endereço simplificado (remove números e detalhes)
    const enderecoSimplificado = enderecoLimpo
        .replace(/\d+/g, '') // Remove números
        .replace(/[^\w\s]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, ' ') // Remove espaços múltiplos
        .trim();
    if (enderecoSimplificado && enderecoSimplificado.length > 3 && enderecoSimplificado !== enderecoLimpo) {
        const variacao3 = `${enderecoSimplificado}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`;
        variacoes.push(variacao3);
        console.log('🔧 [normalizarEndereco] Variação 3 (simplificado):', variacao3);
    }
    // Variação 4: Apenas cidade e estado (fallback mais genérico)
    const variacao4 = `${cidadeNormalizada}, ${estadoNormalizado}, Brasil`;
    variacoes.push(variacao4);
    console.log('🔧 [normalizarEndereco] Variação 4 (apenas cidade/estado):', variacao4);
    // Variação 5: Endereço com CEP (se disponível)
    if (enderecoLimpo.match(/\d{5}-?\d{3}/)) {
        const variacao5 = `${enderecoLimpo}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`;
        variacoes.push(variacao5);
        console.log('🔧 [normalizarEndereco] Variação 5 (com CEP):', variacao5);
    }
    // Variação 6: Apenas bairro + cidade + estado (se bairro existir)
    if (bairroNormalizado && bairroNormalizado.length > 2) {
        const variacao6 = `${bairroNormalizado}, ${cidadeNormalizada}, ${estadoNormalizado}, Brasil`;
        variacoes.push(variacao6);
        console.log('🔧 [normalizarEndereco] Variação 6 (apenas bairro):', variacao6);
    }
    console.log('🔧 [normalizarEndereco] Total de variações criadas:', variacoes.length);
    return variacoes;
}
// Função para obter coordenadas via geocodificação
async function getCoordinates(endereco, cidade, estado, bairro) {
    try {
        console.log('🔍 [getCoordinates] Iniciando geocodificação:', { endereco, cidade, estado, bairro });
        // Validar se temos os dados mínimos necessários
        if (!endereco || !cidade || !estado) {
            console.log('⚠️ [getCoordinates] Dados de endereço incompletos:', { endereco, cidade, estado });
            return { latitude: null, longitude: null };
        }
        // Normalizar e criar variações do endereço
        const variacoes = normalizarEndereco(endereco, cidade, estado, bairro);
        console.log('🔍 [getCoordinates] Tentando geocodificar com variações:', variacoes);
        // Tentar cada variação até encontrar coordenadas
        for (let i = 0; i < variacoes.length; i++) {
            const enderecoCompleto = variacoes[i];
            console.log(`📍 [getCoordinates] Tentativa ${i + 1}: ${enderecoCompleto}`);
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1&countrycodes=br`;
                console.log(`🌐 [getCoordinates] Fazendo requisição para: ${url}`);
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'SegTrack-App/1.0'
                    }
                });
                if (!response.ok) {
                    console.log(`⚠️ [getCoordinates] Resposta não OK: ${response.status} ${response.statusText}`);
                    continue;
                }
                const data = await response.json();
                console.log(`📋 [getCoordinates] Resposta da API:`, data);
                if (data && data.length > 0) {
                    const result = {
                        latitude: parseFloat(data[0].lat),
                        longitude: parseFloat(data[0].lon)
                    };
                    console.log(`✅ [getCoordinates] Coordenadas encontradas na tentativa ${i + 1}:`, result);
                    return result;
                }
                else {
                    console.log(`⚠️ [getCoordinates] Nenhum resultado encontrado para: ${enderecoCompleto}`);
                }
            }
            catch (fetchError) {
                console.error(`❌ [getCoordinates] Erro na tentativa ${i + 1}:`, fetchError);
            }
            // Aguardar um pouco entre tentativas para não sobrecarregar a API
            if (i < variacoes.length - 1) {
                console.log(`⏳ [getCoordinates] Aguardando 1 segundo antes da próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        console.log('⚠️ [getCoordinates] Nenhuma coordenada encontrada para nenhuma variação do endereço');
        return { latitude: null, longitude: null };
    }
    catch (error) {
        console.error('❌ [getCoordinates] Erro ao geocodificar endereço:', error);
        return { latitude: null, longitude: null };
    }
}
class PrestadorService {
    async list(filters = {}, pagination = { page: 1, pageSize: 20 }) {
        var _a;
        try {
            const db = await (0, prisma_1.ensurePrisma)();
            // Parâmetros de paginação
            const page = pagination.page || 1;
            const pageSize = pagination.pageSize || 20;
            const offset = (page - 1) * pageSize;
            // Se houver filtro de região/local, usar query bruta com unaccent
            if (filters.local && typeof filters.local === 'string' && filters.local.trim().length > 0) {
                console.log('🔍 Usando busca com unaccent para região:', filters.local);
                const valor = filters.local.trim();
                const likeValue = `%${valor}%`;
                // Montar condições WHERE para outros filtros
                let whereConditions = [];
                let params = [likeValue];
                let paramIndex = 2; // $1 já é o likeValue
                // Filtro por nome
                if (filters.nome) {
                    whereConditions.push(`unaccent(lower(p.nome)) LIKE unaccent(lower($${paramIndex}))`);
                    params.push(`%${filters.nome.toLowerCase()}%`);
                    paramIndex++;
                }
                // Filtro por cod_nome
                if (filters.cod_nome) {
                    whereConditions.push(`unaccent(lower(p.cod_nome)) LIKE unaccent(lower($${paramIndex}))`);
                    params.push(`%${filters.cod_nome.toLowerCase()}%`);
                    paramIndex++;
                }
                // Filtro por funções
                if (filters.funcoes && Array.isArray(filters.funcoes) && filters.funcoes.length > 0) {
                    const funcoesPlaceholders = filters.funcoes.map((_, i) => `$${paramIndex + i}`).join(',');
                    whereConditions.push(`EXISTS (
            SELECT 1 FROM "FuncaoPrestador" f 
            WHERE f."prestadorId" = p.id 
            AND unaccent(lower(f.funcao)) IN (${funcoesPlaceholders})
          )`);
                    filters.funcoes.forEach((f) => params.push(f.toLowerCase()));
                    paramIndex += filters.funcoes.length;
                }
                // Filtro por regiões específicas
                if (filters.regioes && Array.isArray(filters.regioes) && filters.regioes.length > 0) {
                    const regioesPlaceholders = filters.regioes.map((_, i) => `$${paramIndex + i}`).join(',');
                    whereConditions.push(`EXISTS (
            SELECT 1 FROM "RegiaoPrestador" r 
            WHERE r."prestadorId" = p.id 
            AND unaccent(lower(r.regiao)) IN (${regioesPlaceholders})
          )`);
                    filters.regioes.forEach((r) => params.push(r.toLowerCase()));
                    paramIndex += filters.regioes.length;
                }
                // Filtro para prestadores sem valores monetários
                if (filters.sem_valores) {
                    whereConditions.push(`(
            p.valor_acionamento IS NULL OR p.valor_acionamento = 0 OR
            p.valor_hora_adc IS NULL OR p.valor_hora_adc = 0 OR
            p.valor_km_adc IS NULL OR p.valor_km_adc = 0 OR
            p.franquia_km IS NULL OR p.franquia_km = 0
          )`);
                }
                // Construir a cláusula WHERE completa
                const whereClause = whereConditions.length > 0 ? `AND ${whereConditions.join(' AND ')}` : '';
                // Query principal com unaccent para busca insensível a acentos
                const query = `
          SELECT DISTINCT p.*
          FROM "Prestador" p
          LEFT JOIN "RegiaoPrestador" r ON r."prestadorId" = p.id
          WHERE (
            unaccent(lower(COALESCE(p.bairro, ''))) LIKE unaccent(lower($1))
            OR unaccent(lower(COALESCE(p.cidade, ''))) LIKE unaccent(lower($1))
            OR unaccent(lower(COALESCE(p.estado, ''))) LIKE unaccent(lower($1))
            OR unaccent(lower(COALESCE(r.regiao, ''))) LIKE unaccent(lower($1))
          )
          ${whereClause}
          ORDER BY p.nome ASC
          LIMIT ${pageSize} OFFSET ${offset}
        `;
                // Query para contar total
                const countQuery = `
          SELECT COUNT(DISTINCT p.id) as total
          FROM "Prestador" p
          LEFT JOIN "RegiaoPrestador" r ON r."prestadorId" = p.id
          WHERE (
            unaccent(lower(COALESCE(p.bairro, ''))) LIKE unaccent(lower($1))
            OR unaccent(lower(COALESCE(p.cidade, ''))) LIKE unaccent(lower($1))
            OR unaccent(lower(COALESCE(p.estado, ''))) LIKE unaccent(lower($1))
            OR unaccent(lower(COALESCE(r.regiao, ''))) LIKE unaccent(lower($1))
          )
          ${whereClause}
        `;
                console.log('🔍 Query executada:', query);
                console.log('🔍 Parâmetros:', params);
                // Executar queries
                const data = await db.$queryRawUnsafe(query, ...params);
                const totalResult = await db.$queryRawUnsafe(countQuery, ...params);
                const total = Number((_a = totalResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
                // Buscar relacionamentos para os prestadores encontrados
                if (Array.isArray(data) && data.length > 0) {
                    const prestadorIds = data.map((p) => p.id);
                    const [funcoes, veiculos, regioes] = await Promise.all([
                        db.funcaoPrestador.findMany({
                            where: { prestadorId: { in: prestadorIds } },
                            orderBy: { funcao: 'asc' }
                        }),
                        db.tipoVeiculoPrestador.findMany({
                            where: { prestadorId: { in: prestadorIds } },
                            orderBy: { tipo: 'asc' }
                        }),
                        db.regiaoPrestador.findMany({
                            where: { prestadorId: { in: prestadorIds } },
                            orderBy: { regiao: 'asc' }
                        })
                    ]);
                    // Agrupar relacionamentos por prestador
                    const funcoesPorPrestador = funcoes.reduce((acc, f) => {
                        if (!acc[f.prestadorId])
                            acc[f.prestadorId] = [];
                        acc[f.prestadorId].push(f);
                        return acc;
                    }, {});
                    const veiculosPorPrestador = veiculos.reduce((acc, v) => {
                        if (!acc[v.prestadorId])
                            acc[v.prestadorId] = [];
                        acc[v.prestadorId].push(v);
                        return acc;
                    }, {});
                    const regioesPorPrestador = regioes.reduce((acc, r) => {
                        if (!acc[r.prestadorId])
                            acc[r.prestadorId] = [];
                        acc[r.prestadorId].push(r);
                        return acc;
                    }, {});
                    // Adicionar relacionamentos aos prestadores
                    const prestadoresCompletos = data.map((prestador) => (Object.assign(Object.assign({}, prestador), { funcoes: funcoesPorPrestador[prestador.id] || [], veiculos: veiculosPorPrestador[prestador.id] || [], regioes: regioesPorPrestador[prestador.id] || [] })));
                    return {
                        data: prestadoresCompletos,
                        total,
                        page,
                        pageSize
                    };
                }
                return {
                    data: [],
                    total: 0,
                    page,
                    pageSize
                };
            }
            // Fallback: busca normal do Prisma se não houver filtro de local/região
            console.log('🔍 Usando busca normal do Prisma');
            const where = {};
            // Se ambos nome e cod_nome são fornecidos, usar OR
            if (filters.nome && filters.cod_nome) {
                where.OR = [
                    { nome: { contains: filters.nome, mode: 'insensitive' } },
                    { cod_nome: { contains: filters.cod_nome, mode: 'insensitive' } }
                ];
            }
            else {
                // Caso contrário, usar filtros individuais
                if (filters.nome) {
                    where.nome = { contains: filters.nome, mode: 'insensitive' };
                }
                if (filters.cod_nome) {
                    where.cod_nome = { contains: filters.cod_nome, mode: 'insensitive' };
                }
            }
            if (filters.regioes && Array.isArray(filters.regioes) && filters.regioes.length > 0) {
                where.regioes = { some: { regiao: { in: filters.regioes } } };
            }
            if (filters.funcoes && Array.isArray(filters.funcoes) && filters.funcoes.length > 0) {
                where.funcoes = { some: { funcao: { in: filters.funcoes } } };
            }
            // Filtro para prestadores sem valores monetários
            if (filters.sem_valores) {
                where.OR = [
                    { valor_acionamento: { equals: null } },
                    { valor_acionamento: { equals: 0 } },
                    { valor_hora_adc: { equals: null } },
                    { valor_hora_adc: { equals: 0 } },
                    { valor_km_adc: { equals: null } },
                    { valor_km_adc: { equals: 0 } },
                    { franquia_km: { equals: null } },
                    { franquia_km: { equals: 0 } }
                ];
            }
            const skip = (pagination.page - 1) * pagination.pageSize;
            const take = pagination.pageSize;
            const [data, total] = await Promise.all([
                db.prestador.findMany({
                    where,
                    include: {
                        funcoes: true,
                        veiculos: true,
                        regioes: true
                    },
                    skip,
                    take,
                    orderBy: { nome: 'asc' }
                }),
                db.prestador.count({ where })
            ]);
            return {
                data,
                total,
                page: pagination.page,
                pageSize: pagination.pageSize
            };
        }
        catch (error) {
            console.error('Erro ao listar prestadores:', error);
            throw new AppError_1.AppError('Erro ao listar prestadores');
        }
    }
    async listPublic() {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
            return await db.prestador.findMany({
                where: { aprovado: true },
                include: {
                    funcoes: true,
                    veiculos: true,
                    regioes: true
                }
            });
        }
        catch (error) {
            console.error('Erro ao buscar prestadores públicos:', error);
            throw new AppError_1.AppError('Erro ao buscar prestadores públicos');
        }
    }
    async findById(id) {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
            const prestador = await db.prestador.findUnique({
                where: { id },
                include: {
                    funcoes: true,
                    veiculos: true,
                    regioes: true
                }
            });
            if (!prestador) {
                throw new AppError_1.AppError('Prestador não encontrado', 404);
            }
            return prestador;
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                throw error;
            console.error('Erro ao buscar prestador:', error);
            throw new AppError_1.AppError('Erro ao buscar prestador');
        }
    }
    async create(data) {
        try {
            console.log('🔧 [PrestadorService.create] Iniciando criação de prestador:', {
                nome: data.nome,
                endereco: data.endereco,
                cidade: data.cidade,
                estado: data.estado,
                bairro: data.bairro
            });
            const db = await (0, prisma_1.ensurePrisma)();
            // Obter coordenadas automaticamente
            console.log('📍 [PrestadorService.create] Chamando getCoordinates...');
            const coordinates = await getCoordinates(data.endereco, data.cidade, data.estado, data.bairro);
            console.log('📍 [PrestadorService.create] Coordenadas obtidas:', coordinates);
            const prestadorData = {
                nome: data.nome,
                cpf: data.cpf,
                cod_nome: data.cod_nome,
                telefone: data.telefone,
                email: data.email,
                tipo_pix: data.tipo_pix,
                chave_pix: data.chave_pix,
                cep: data.cep,
                endereco: data.endereco,
                bairro: data.bairro,
                cidade: data.cidade,
                estado: data.estado,
                valor_acionamento: data.valor_acionamento,
                franquia_horas: data.franquia_horas,
                franquia_km: data.franquia_km,
                valor_hora_adc: data.valor_hora_adc,
                valor_km_adc: data.valor_km_adc,
                aprovado: data.aprovado,
                modelo_antena: data.modelo_antena,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                funcoes: {
                    create: data.funcoes
                },
                veiculos: {
                    create: data.veiculos
                },
                regioes: {
                    create: data.regioes
                }
            };
            console.log('💾 [PrestadorService.create] Salvando prestador com dados:', {
                nome: prestadorData.nome,
                latitude: prestadorData.latitude,
                longitude: prestadorData.longitude,
                funcoesCount: prestadorData.funcoes.create.length,
                veiculosCount: prestadorData.veiculos.create.length,
                regioesCount: prestadorData.regioes.create.length
            });
            const result = await db.prestador.create({
                data: prestadorData,
                include: {
                    funcoes: true,
                    veiculos: true,
                    regioes: true
                }
            });
            // Sincronizar usuarioPrestador
            if (result.email && result.cpf) {
                const usuarioExistente = await db.usuarioPrestador.findFirst({
                    where: { prestador_id: result.id }
                });
                if (!usuarioExistente) {
                    const senha_hash = await bcrypt_1.default.hash(result.cpf.replace(/\D/g, ''), 10);
                    await db.usuarioPrestador.create({
                        data: {
                            prestador_id: result.id,
                            email: result.email,
                            senha_hash,
                            ativo: true,
                            primeiro_acesso: true
                        }
                    });
                    console.log(`✅ UsuarioPrestador criado automaticamente para o prestador ${result.nome} (${result.email})`);
                }
            }
            console.log('✅ [PrestadorService.create] Prestador criado com sucesso:', {
                id: result.id,
                nome: result.nome,
                latitude: result.latitude,
                longitude: result.longitude
            });
            return result;
        }
        catch (error) {
            console.error('❌ [PrestadorService.create] Erro ao criar prestador:', error);
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if ((error === null || error === void 0 ? void 0 : error.code) === 'P2002') {
                    throw new AppError_1.AppError('Já existe um prestador com este CPF ou email');
                }
            }
            throw new AppError_1.AppError('Erro ao criar prestador');
        }
    }
    async update(id, data) {
        var _a, _b, _c;
        try {
            const db = await (0, prisma_1.ensurePrisma)();
            console.log('🔍 Dados recebidos para atualização:', {
                id,
                nome: data.nome,
                cpf: data.cpf,
                endereco: data.endereco,
                cidade: data.cidade,
                estado: data.estado,
                funcoes: (_a = data.funcoes) === null || _a === void 0 ? void 0 : _a.length,
                veiculos: (_b = data.veiculos) === null || _b === void 0 ? void 0 : _b.length,
                regioes: (_c = data.regioes) === null || _c === void 0 ? void 0 : _c.length
            });
            // Verificar se o prestador existe
            const prestadorExistente = await this.findById(id);
            console.log('✅ Prestador existente encontrado:', prestadorExistente === null || prestadorExistente === void 0 ? void 0 : prestadorExistente.id);
            // Obter coordenadas automaticamente sempre que o endereço for atualizado
            console.log('📍 Atualizando coordenadas para endereço:', data.endereco, data.cidade, data.estado);
            const coordinates = await getCoordinates(data.endereco, data.cidade, data.estado, data.bairro);
            if (coordinates.latitude && coordinates.longitude) {
                console.log('✅ Coordenadas obtidas:', coordinates);
            }
            else {
                console.log('⚠️ Não foi possível obter coordenadas para o endereço');
            }
            // Deletar relacionamentos existentes
            console.log('🗑️ Deletando relacionamentos existentes...');
            await db.$transaction([
                db.funcaoPrestador.deleteMany({
                    where: { prestadorId: id }
                }),
                db.tipoVeiculoPrestador.deleteMany({
                    where: { prestadorId: id }
                }),
                db.regiaoPrestador.deleteMany({
                    where: { prestadorId: id }
                })
            ]);
            console.log('✅ Relacionamentos deletados com sucesso');
            // Preparar dados para atualização
            const updateData = {
                nome: data.nome,
                cpf: data.cpf,
                cod_nome: data.cod_nome,
                telefone: data.telefone,
                email: data.email,
                tipo_pix: data.tipo_pix,
                chave_pix: data.chave_pix,
                cep: data.cep,
                endereco: data.endereco,
                bairro: data.bairro,
                cidade: data.cidade,
                estado: data.estado,
                valor_acionamento: data.valor_acionamento,
                franquia_horas: data.franquia_horas,
                franquia_km: data.franquia_km,
                valor_hora_adc: data.valor_hora_adc,
                valor_km_adc: data.valor_km_adc,
                aprovado: data.aprovado,
                modelo_antena: data.modelo_antena,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                funcoes: {
                    create: data.funcoes || []
                },
                veiculos: {
                    create: data.veiculos || []
                },
                regioes: {
                    create: data.regioes || []
                }
            };
            console.log('📝 Dados preparados para atualização:', {
                id,
                nome: updateData.nome,
                latitude: updateData.latitude,
                longitude: updateData.longitude,
                funcoesCount: updateData.funcoes.create.length,
                veiculosCount: updateData.veiculos.create.length,
                regioesCount: updateData.regioes.create.length
            });
            // Atualizar prestador com novos dados
            const resultado = await db.prestador.update({
                where: { id },
                data: updateData,
                include: {
                    funcoes: true,
                    veiculos: true,
                    regioes: true
                }
            });
            // Sincronizar usuarioPrestador (atualizar email)
            if (resultado.email) {
                await db.usuarioPrestador.updateMany({
                    where: { prestador_id: resultado.id },
                    data: { email: resultado.email }
                });
                console.log(`✅ UsuarioPrestador sincronizado (email atualizado) para o prestador ${resultado.nome} (${resultado.email})`);
            }
            console.log('✅ Prestador atualizado com sucesso:', {
                id: resultado.id,
                nome: resultado.nome,
                latitude: resultado.latitude,
                longitude: resultado.longitude
            });
            return resultado;
        }
        catch (error) {
            console.error('❌ Erro detalhado ao atualizar prestador:', {
                message: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error),
                stack: error instanceof Error ? error instanceof Error ? error.stack : undefined : undefined,
                code: error === null || error === void 0 ? void 0 : error.code,
                meta: error === null || error === void 0 ? void 0 : error.meta
            });
            if (error instanceof AppError_1.AppError)
                throw error;
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if ((error === null || error === void 0 ? void 0 : error.code) === 'P2002') {
                    throw new AppError_1.AppError('Já existe um prestador com este CPF ou email');
                }
                console.error('❌ Erro do Prisma:', {
                    code: error === null || error === void 0 ? void 0 : error.code,
                    meta: error.meta,
                    message: error instanceof Error ? error.message : String(error)
                });
            }
            throw new AppError_1.AppError(`Erro ao atualizar prestador: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`);
        }
    }
    async delete(id) {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
            // Verificar se o prestador existe
            await this.findById(id);
            // Deletar prestador e seus relacionamentos
            await db.$transaction([
                db.funcaoPrestador.deleteMany({
                    where: { prestadorId: id }
                }),
                db.tipoVeiculoPrestador.deleteMany({
                    where: { prestadorId: id }
                }),
                db.regiaoPrestador.deleteMany({
                    where: { prestadorId: id }
                }),
                db.prestador.delete({
                    where: { id }
                })
            ]);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                throw error;
            console.error('Erro ao deletar prestador:', error);
            throw new AppError_1.AppError('Erro ao deletar prestador');
        }
    }
    async findByRegiao(regiao) {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
            return await db.prestador.findMany({
                where: {
                    regioes: {
                        some: {
                            regiao
                        }
                    }
                },
                include: {
                    funcoes: true,
                    veiculos: true,
                    regioes: true
                }
            });
        }
        catch (error) {
            console.error('Erro ao buscar prestadores por região:', error);
            throw new AppError_1.AppError('Erro ao buscar prestadores por região');
        }
    }
    async findByFuncao(funcao) {
        try {
            const db = await (0, prisma_1.ensurePrisma)();
            return await db.prestador.findMany({
                where: {
                    funcoes: {
                        some: {
                            funcao
                        }
                    }
                },
                include: {
                    funcoes: true,
                    veiculos: true,
                    regioes: true
                }
            });
        }
        catch (error) {
            console.error('Erro ao buscar prestadores por função:', error);
            throw new AppError_1.AppError('Erro ao buscar prestadores por função');
        }
    }
    async listMapa() {
        try {
            console.log('🔍 [PrestadorService.listMapa] Iniciando busca de prestadores para o mapa');
            const db = await (0, prisma_1.ensurePrisma)();
            console.log('✅ [PrestadorService.listMapa] Conexão com banco estabelecida');
            const prestadores = await db.prestador.findMany({
                select: {
                    id: true,
                    nome: true,
                    telefone: true,
                    latitude: true,
                    longitude: true,
                    cidade: true,
                    estado: true,
                    bairro: true,
                    modelo_antena: true, // ✅ Adicionado campo modelo_antena
                    regioes: { select: { regiao: true } },
                    funcoes: { select: { funcao: true } }
                },
                where: {
                    latitude: { not: null },
                    longitude: { not: null }
                }
            });
            console.log('✅ [PrestadorService.listMapa] Prestadores encontrados:', prestadores.length);
            if (prestadores.length > 0) {
                console.log('✅ [PrestadorService.listMapa] Primeiro prestador:', {
                    id: prestadores[0].id,
                    nome: prestadores[0].nome,
                    latitude: prestadores[0].latitude,
                    longitude: prestadores[0].longitude,
                    modelo_antena: prestadores[0].modelo_antena
                });
            }
            return prestadores;
        }
        catch (error) {
            console.error('❌ [PrestadorService.listMapa] Erro ao buscar prestadores para o mapa:', {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : undefined,
                code: error === null || error === void 0 ? void 0 : error.code
            });
            throw error;
        }
    }
}
exports.PrestadorService = PrestadorService;
