import { Router } from 'express';
import { requirePermission, authenticateToken, authenticateCliente } from '../infrastructure/middleware/auth.middleware';
import { ensurePrisma } from '../lib/prisma';
// @ts-ignore
import { remove as removeDiacritics } from 'diacritics';

const router = Router();

// Middleware de autenticação para todas as rotas de cliente
router.use(authenticateCliente);

// Rota protegida que requer permissão específica
router.get('/admin', requirePermission('read:dashboard'), async (_req, res) => {
  res.json({ message: 'Acesso permitido - Área administrativa' });
});

// Rota protegida que requer outra permissão
router.get('/manager', requirePermission('read:relatorio'), async (_req, res) => {
  res.json({ message: 'Acesso permitido - Área gerencial' });
});

// Rota para obter dados completos do cliente logado
router.get('/cliente/perfil', async (req, res) => {
  try {
    const cliente = req.cliente;
    if (!cliente) {
      return res.status(401).json({ message: 'Cliente não autenticado' });
    }

    const db = await ensurePrisma();
    const clienteCompleto = await db.cliente.findUnique({
      where: { id: parseInt(cliente.sub) },
      select: {
        id: true,
        nome: true,
        nome_fantasia: true,
        cnpj: true,
        contato: true,
        telefone: true,
        email: true,
        endereco: true,
        bairro: true,
        cidade: true,
        estado: true,
        cep: true,
        logo: true
      }
    });

    if (!clienteCompleto) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    res.json(clienteCompleto);
  } catch (error) {
    console.error('Erro ao obter perfil do cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para obter ocorrências do cliente
router.get('/cliente/ocorrencias', async (req, res) => {
  try {
    console.log('🔍 Iniciando busca de ocorrências do cliente...');
    
    const cliente = req.cliente;
    if (!cliente) {
      console.log('❌ Cliente não autenticado');
      return res.status(401).json({ message: 'Cliente não autenticado' });
    }

    console.log('👤 Cliente autenticado:', {
      id: cliente.sub,
      razaoSocial: cliente.razaoSocial,
      cnpj: cliente.cnpj
    });

    const db = await ensurePrisma();
    if (!db) {
      console.error('❌ Erro: Instância do Prisma não disponível');
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Normalizar nome do cliente autenticado
    const nomeCliente = removeDiacritics(cliente.razaoSocial || '').toLowerCase().replace(/\s+/g, '');
    console.log('📝 Nome do cliente normalizado:', nomeCliente);

    // Buscar todas as ocorrências
    console.log('🔍 Buscando ocorrências no banco de dados...');
    const ocorrencias = await db.ocorrencia.findMany({
      orderBy: { criado_em: 'desc' },
      select: {
        id: true,
        placa1: true,
        placa2: true,
        placa3: true,
        cliente: true, // Incluir o campo cliente para debug
        tipo: true,
        status: true,
        criado_em: true,
        inicio: true,
        chegada: true,
        termino: true,
        prestador: true,
        operador: true,
        cidade: true,
        estado: true,
        km: true,
        despesas: true,
        descricao: true,
        resultado: true,
        hashRastreamento: true,
        despesas_detalhadas: true,
        passagem_servico: true,
        os: true, // Adicionar campo OS
        fotos: {
          select: {
            id: true,
            url: true,
            legenda: true
          }
        }
      }
    });

    console.log(`📊 Total de ocorrências encontradas: ${ocorrencias.length}`);

    // Filtrar por nome com comparação mais flexível
    console.log('🔍 Filtrando ocorrências por cliente...');
    const ocorrenciasCliente = ocorrencias.filter((o: any) => {
      const nomeOcorrencia = removeDiacritics(o.cliente || '').toLowerCase().replace(/\s+/g, '');
      
      // Comparação mais flexível: verificar se o nome do cliente contém o nome autenticado
      // ou se o nome autenticado contém o nome do cliente
      const match = nomeOcorrencia.includes(nomeCliente) || nomeCliente.includes(nomeOcorrencia);
      
      if (!match) {
        console.log(`❌ Não corresponde: "${nomeOcorrencia}" não contém "${nomeCliente}" e vice-versa`);
      } else {
        console.log(`✅ Corresponde: "${nomeOcorrencia}" <-> "${nomeCliente}"`);
      }
      
      return match;
    });

    console.log(`✅ Ocorrências filtradas para o cliente: ${ocorrenciasCliente.length}`);

    // Log das primeiras ocorrências para debug
    if (ocorrenciasCliente.length > 0) {
      console.log('📋 Primeiras ocorrências do cliente:', ocorrenciasCliente.slice(0, 3).map((o: any) => ({
        id: o.id,
        placa: o.placa1,
        cliente: o.cliente,
        status: o.status,
        criado_em: o.criado_em
      })));
    }

    res.json({
      message: 'Lista de ocorrências do cliente',
      cliente: cliente.razaoSocial,
      totalOcorrencias: ocorrencias.length,
      ocorrenciasFiltradas: ocorrenciasCliente.length,
      ocorrencias: ocorrenciasCliente
    });
  } catch (error) {
    console.error('❌ Erro ao obter ocorrências do cliente:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cliente: req.cliente
    });
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Rota para obter estatísticas do cliente
router.get('/cliente/estatisticas', async (req, res) => {
  try {
    console.log('🔍 Iniciando busca de estatísticas do cliente...');
    
    const cliente = req.cliente;
    if (!cliente) {
      console.log('❌ Cliente não autenticado');
      return res.status(401).json({ message: 'Cliente não autenticado' });
    }

    console.log('👤 Cliente autenticado:', {
      id: cliente.sub,
      razaoSocial: cliente.razaoSocial,
      cnpj: cliente.cnpj
    });

    const db = await ensurePrisma();
    if (!db) {
      console.error('❌ Erro: Instância do Prisma não disponível');
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Normalizar nome do cliente autenticado
    const nomeCliente = removeDiacritics(cliente.razaoSocial || '').toLowerCase().replace(/\s+/g, '');
    console.log('📝 Nome do cliente normalizado:', nomeCliente);

    // Buscar todas as ocorrências
    console.log('🔍 Buscando ocorrências no banco de dados...');
    const ocorrencias = await db.ocorrencia.findMany({
      orderBy: { criado_em: 'desc' },
      select: {
        id: true,
        cliente: true,
        tipo: true,
        status: true,
        resultado: true,
        criado_em: true,
        hashRastreamento: true
      }
    });

    console.log(`📊 Total de ocorrências encontradas: ${ocorrencias.length}`);

    // Filtrar por nome com comparação mais flexível
    console.log('🔍 Filtrando ocorrências por cliente...');
    const ocorrenciasCliente = ocorrencias.filter((o: any) => {
      const nomeOcorrencia = removeDiacritics(o.cliente || '').toLowerCase().replace(/\s+/g, '');
      
      // Comparação mais flexível: verificar se o nome do cliente contém o nome autenticado
      // ou se o nome autenticado contém o nome do cliente
      const match = nomeOcorrencia.includes(nomeCliente) || nomeCliente.includes(nomeOcorrencia);
      
      return match;
    });

    console.log(`✅ Ocorrências filtradas para o cliente: ${ocorrenciasCliente.length}`);

    // Calcular estatísticas
    const totalOcorrencias = ocorrenciasCliente.length;
    const emAndamento = ocorrenciasCliente.filter((o: any) => o.status === 'em_andamento').length;
    const recuperadas = ocorrenciasCliente.filter((o: any) => 
      o.resultado === 'Recuperado' || o.resultado === 'RECUPERADO'
    ).length;
    const naoRecuperadas = ocorrenciasCliente.filter((o: any) => 
      o.resultado === 'Não Recuperado' || o.resultado === 'NAO_RECUPERADO'
    ).length;
    const canceladas = ocorrenciasCliente.filter((o: any) => 
      o.status === 'cancelada' || o.resultado === 'Cancelado' || o.resultado === 'CANCELADO'
    ).length;
    const rastreamentosAtivos = ocorrenciasCliente.filter((o: any) => 
      o.status === 'em_andamento' && o.hashRastreamento
    ).length;
    const relatoriosGerados = recuperadas + naoRecuperadas + canceladas;

    // Estatísticas específicas para ITURAN
    const furtoRoubo = ocorrenciasCliente.filter((o: any) => 
      o.tipo === 'furto' || o.tipo === 'roubo' || o.tipo === 'Furto' || o.tipo === 'Roubo'
    ).length;
    const apropriacao = ocorrenciasCliente.filter((o: any) => 
      o.tipo === 'apropriação' || o.tipo === 'apropriacao' || o.tipo === 'Apropriação'
    ).length;

    const estatisticas = {
      totalOcorrencias,
      emAndamento,
      recuperadas,
      naoRecuperadas,
      canceladas,
      rastreamentosAtivos,
      relatoriosGerados,
      furtoRoubo,
      apropriacao
    };

    console.log('✅ Estatísticas calculadas:', estatisticas);

    res.json({
      message: 'Estatísticas do cliente',
      cliente: cliente.razaoSocial,
      estatisticas
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas do cliente:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cliente: req.cliente
    });
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Rota para obter rastreamentos do cliente
router.get('/cliente/rastreamentos', async (req, res) => {
  try {
    console.log('🔍 Iniciando busca de rastreamentos do cliente...');
    const cliente = req.cliente;
    if (!cliente) {
      console.log('❌ Cliente não autenticado');
      return res.status(401).json({ message: 'Cliente não autenticado' });
    }

    console.log('👤 Cliente autenticado:', {
      id: cliente.sub,
      razaoSocial: cliente.razaoSocial,
      cnpj: cliente.cnpj
    });

    const db = await ensurePrisma();
    if (!db) {
      console.error('❌ Erro: Instância do Prisma não disponível');
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Normalizar nome do cliente autenticado
    const nomeCliente = removeDiacritics(cliente.razaoSocial || '').toLowerCase().replace(/\s+/g, '');
    console.log('📝 Nome do cliente normalizado:', nomeCliente);

    // Buscar ocorrências do cliente
    const ocorrencias = await db.ocorrencia.findMany({
      where: {
        cliente: {
          contains: cliente.razaoSocial || cliente.cnpj || '',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        placa1: true,
        prestador: true,
        status: true,
        criado_em: true,
        endereco: true,
        bairro: true,
        cidade: true,
        estado: true
      }
    });

    console.log(`📊 Ocorrências do cliente encontradas: ${ocorrencias.length}`);

    // Buscar rastreamentos ativos para as ocorrências do cliente
    const rastreamentos = [];
    for (const ocorrencia of ocorrencias) {
      // Buscar última posição do rastreamento para a ocorrência
      const ultimaPosicao = await db.rastreamentoPrestador.findFirst({
        where: {
          ocorrencia_id: ocorrencia.id
        },
        orderBy: {
          timestamp: 'desc'
        }
      });

      console.log('[DEBUG] Ocorrência:', ocorrencia.id, '| Última posição encontrada:', ultimaPosicao ? {
        id: ultimaPosicao.id,
        prestador_id: ultimaPosicao.prestador_id,
        latitude: ultimaPosicao.latitude,
        longitude: ultimaPosicao.longitude,
        timestamp: ultimaPosicao.timestamp
      } : 'NENHUMA');

      if (ultimaPosicao) {
        // Buscar prestador pelo id do rastreamento
        const prestador = await db.prestador.findUnique({
          where: { id: ultimaPosicao.prestador_id },
          select: { id: true, nome: true, telefone: true }
        });

        console.log('[DEBUG] Prestador encontrado para última posição:', prestador ? prestador.id : 'NENHUM');

        if (prestador) {
          rastreamentos.push({
            id: ultimaPosicao.id,
            ocorrencia_id: ocorrencia.id,
            prestador_id: prestador.id,
            prestador_nome: prestador.nome,
            prestador_telefone: prestador.telefone,
            ocorrencia_placa: ocorrencia.placa1,
            ocorrencia_tipo: 'Recuperação',
            ocorrencia_status: ocorrencia.status,
            ultima_posicao: {
              id: ultimaPosicao.id,
              prestador_id: ultimaPosicao.prestador_id,
              ocorrencia_id: ultimaPosicao.ocorrencia_id,
              latitude: ultimaPosicao.latitude,
              longitude: ultimaPosicao.longitude,
              velocidade: ultimaPosicao.velocidade,
              direcao: ultimaPosicao.direcao,
              altitude: ultimaPosicao.altitude,
              precisao: ultimaPosicao.precisao,
              bateria: ultimaPosicao.bateria,
              sinal_gps: ultimaPosicao.sinal_gps,
              observacoes: ultimaPosicao.observacoes,
              timestamp: ultimaPosicao.timestamp,
              status: ultimaPosicao.status
            },
            status: 'ativo',
            criado_em: ultimaPosicao.timestamp,
            atualizado_em: ultimaPosicao.timestamp
          });
        }
      }
    }

    console.log(`✅ Rastreamentos encontrados: ${rastreamentos.length}`);

    res.json({
      message: 'Lista de rastreamentos do cliente',
      cliente: cliente.razaoSocial,
      rastreamentos: rastreamentos,
      total: rastreamentos.length
    });
  } catch (error) {
    console.error('❌ Erro ao obter rastreamentos do cliente:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cliente: req.cliente
    });
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Rota para obter relatórios do cliente
router.get('/cliente/relatorios', async (req, res) => {
  try {
    const cliente = req.cliente;
    if (!cliente) {
      return res.status(401).json({ message: 'Cliente não autenticado' });
    }

    const db = await ensurePrisma();
    const relatorios = await db.relatorio.findMany({
      where: { cliente: cliente.razaoSocial },
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        tipo: true,
        dataAcionamento: true,
        caminhoPdf: true,
        criadoEm: true
      }
    });

    res.json({
      message: 'Lista de relatórios do cliente',
      cliente: cliente.razaoSocial,
      relatorios: relatorios
    });
  } catch (error) {
    console.error('Erro ao obter relatórios do cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Rota para obter prestadores para o mapa (acessível por clientes)
router.get('/cliente/prestadores/mapa', async (req, res) => {
  try {
    console.log('🔍 [ProtectedRoutes] Cliente solicitando prestadores para o mapa');
    
    const cliente = req.cliente;
    if (!cliente) {
      console.log('❌ Cliente não autenticado');
      return res.status(401).json({ message: 'Cliente não autenticado' });
    }

    console.log('👤 Cliente autenticado:', {
      id: cliente.sub,
      razaoSocial: cliente.razaoSocial,
      cnpj: cliente.cnpj
    });

    const db = await ensurePrisma();
    if (!db) {
      console.error('❌ Erro: Instância do Prisma não disponível');
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Buscar prestadores com coordenadas (mesmo método do endpoint público)
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
        modelo_antena: true,
        regioes: { select: { regiao: true } },
        funcoes: { select: { funcao: true } }
      },
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });

    console.log('✅ [ProtectedRoutes] Prestadores encontrados para cliente:', prestadores.length);
    
    if (prestadores.length > 0) {
      console.log('✅ [ProtectedRoutes] Primeiro prestador:', {
        id: prestadores[0].id,
        nome: prestadores[0].nome,
        latitude: prestadores[0].latitude,
        longitude: prestadores[0].longitude
      });
    }

    res.json(prestadores);
  } catch (error: unknown) {
    console.error('❌ [ProtectedRoutes] Erro ao buscar prestadores para cliente:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      code: (error as any)?.code
    });
    res.status(500).json({ 
      error: 'Erro ao buscar prestadores para o mapa', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});


export default router; 