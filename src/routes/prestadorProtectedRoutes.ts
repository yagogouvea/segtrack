import { Router } from 'express';
import { authenticateToken } from '../infrastructure/middleware/auth.middleware';
import { ensurePrisma } from '../lib/prisma';
import { formatBrazilianTime, timestampToBrazilianString } from '../utils/timezone';

const router = Router();

// Rota para salvar posição do prestador
router.post('/rastreamento', authenticateToken, async (req, res) => {
  try {
    console.log('📍 Salvando posição do prestador...');
    
    const user = req.user;
    if (!user) {
      console.log('❌ Prestador não autenticado');
      return res.status(401).json({ message: 'Prestador não autenticado' });
    }

    if (user.tipo !== 'prestador') {
      console.log('❌ Usuário não é prestador');
      return res.status(403).json({ message: 'Acesso negado. Apenas prestadores podem acessar esta rota.' });
    }

    const {
      prestador_id,
      ocorrencia_id,
      latitude,
      longitude,
      velocidade,
      direcao,
      altitude,
      precisao,
      bateria,
      sinal_gps,
      observacoes,
      status = 'ativo'
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude e longitude são obrigatórios' });
    }

    const db = await ensurePrisma();
    if (!db) {
      console.error('❌ Erro: Instância do Prisma não disponível');
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Obter prestador_id do usuário autenticado
    const usuarioPrestador = await db.usuarioPrestador.findUnique({
      where: { id: user.id } // Usar user.id em vez de user.id
    });

    if (!usuarioPrestador) {
      return res.status(404).json({ message: 'Usuário prestador não encontrado' });
    }

    // Verificar se a ocorrência está ativa antes de salvar posição
    if (ocorrencia_id) {
      const ocorrencia = await db.ocorrencia.findUnique({ where: { id: ocorrencia_id } });
      if (!ocorrencia || ['concluida', 'cancelada', 'encerrada', 'recuperada', 'não recuperado', 'finalizada'].includes((ocorrencia.status || '').toLowerCase())) {
        console.log(`❌ Ignorando posição: ocorrência ${ocorrencia_id} está finalizada (status: ${ocorrencia?.status})`);
        return res.status(400).json({ message: 'Ocorrência já finalizada. Rastreamento não permitido.' });
      }
    }

    // Salvar posição na tabela RastreamentoPrestador
    const rastreamento = await db.rastreamentoPrestador.create({
      data: {
        prestador_id: usuarioPrestador.prestador_id,
        ocorrencia_id: ocorrencia_id || null,
        latitude,
        longitude,
        velocidade: velocidade || null,
        direcao: direcao || null,
        altitude: altitude || null,
        precisao: precisao || null,
        bateria: bateria || null,
        sinal_gps: sinal_gps || null,
        observacoes: observacoes || null,
        status
      }
    });

    console.log('✅ Posição salva com sucesso:', {
      id: rastreamento.id,
      prestador_id: rastreamento.prestador_id,
      latitude: rastreamento.latitude,
      longitude: rastreamento.longitude,
      timestamp: formatBrazilianTime(rastreamento.timestamp),
      ocorrencia_id: rastreamento.ocorrencia_id,
      placa: req.body.placa1 || 'N/A'
    });

    res.json({
      message: 'Posição salva com sucesso',
      rastreamento: {
        id: rastreamento.id,
        latitude: rastreamento.latitude,
        longitude: rastreamento.longitude,
        timestamp: rastreamento.timestamp,
        timestamp_brasil: formatBrazilianTime(rastreamento.timestamp)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao salvar posição:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Rota para buscar rastreamento de uma ocorrência
router.get('/rastreamento/:ocorrenciaId', authenticateToken, async (req, res) => {
  try {
    const { ocorrenciaId } = req.params;
    
    const user = req.user;
    if (!user || user.tipo !== 'prestador') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Obter prestador_id do usuário autenticado
    const usuarioPrestador = await db.usuarioPrestador.findUnique({
      where: { id: user.id } // Usar user.id em vez de user.id
    });

    if (!usuarioPrestador) {
      return res.status(404).json({ message: 'Usuário prestador não encontrado' });
    }

    const rastreamentos = await db.rastreamentoPrestador.findMany({
      where: {
        ocorrencia_id: parseInt(ocorrenciaId),
        prestador_id: usuarioPrestador.prestador_id
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100 // Limitar a 100 posições mais recentes
    });

    // Converter timestamps para fuso brasileiro
    const rastreamentosComFusoBrasileiro = rastreamentos.map(rastreamento => ({
      ...rastreamento,
      timestamp_brasil: formatBrazilianTime(rastreamento.timestamp)
    }));

    res.json({
      message: 'Rastreamento encontrado',
      rastreamentos: rastreamentosComFusoBrasileiro,
      total: rastreamentos.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar rastreamento:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Endpoint para buscar ocorrências do prestador autenticado
router.get('/prestador/ocorrencias', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      console.log('❌ Prestador não autenticado');
      return res.status(401).json({ message: 'Prestador não autenticado' });
    }

    if (user.tipo !== 'prestador') {
      console.log('❌ Usuário não é prestador');
      return res.status(403).json({ message: 'Acesso negado. Apenas prestadores podem acessar esta rota.' });
    }

    const db = await ensurePrisma();
    if (!db) {
      console.error('❌ Erro: Instância do Prisma não disponível');
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Buscar prestador no banco para validar
    // Primeiro buscar o UsuarioPrestador para obter o prestador_id
    const usuarioPrestador = await db.usuarioPrestador.findUnique({
      where: { id: user.id } // Usar user.id que agora está mapeado corretamente
    });

    if (!usuarioPrestador) {
      console.log(`❌ Usuário prestador não encontrado: ${user.id}`);
      return res.status(404).json({ message: 'Usuário prestador não encontrado' });
    }

    // Agora buscar o prestador usando o prestador_id
    const prestador = await db.prestador.findUnique({
      where: { id: usuarioPrestador.prestador_id }
    });

    if (!prestador) {
      console.log(`❌ Prestador não encontrado no banco: ${user.nome}`);
      return res.status(404).json({ message: 'Prestador não encontrado' });
    }

    console.log(`✅ Prestador encontrado: ${prestador.nome} (ID: ${prestador.id})`);

    // Buscar ocorrências vinculadas ao prestador usando verificação rigorosa
    // Só retornar ocorrências onde o campo 'prestador' corresponde EXATAMENTE ao nome do prestador logado
    let ocorrencias = await db.ocorrencia.findMany({
      where: {
        AND: [
          {
            prestador: prestador.nome // Busca exata pelo nome do prestador
          },
          {
            status: {
              in: ['em_andamento', 'aguardando']
            }
          }
        ]
      },
      include: {
        fotos: true
      },
      orderBy: {
        criado_em: 'desc'
      }
    });

    console.log(`✅ Ocorrências encontradas para o prestador "${prestador.nome}": ${ocorrencias.length}`);

    // Log detalhado das ocorrências encontradas para debug
    if (ocorrencias.length > 0) {
      console.log('📋 Ocorrências vinculadas ao prestador:');
      ocorrencias.forEach(oc => {
        console.log(`   - ID: ${oc.id}, Status: ${oc.status}, Prestador: "${oc.prestador}"`);
      });
    } else {
      console.log(`⚠️ Nenhuma ocorrência encontrada para o prestador "${prestador.nome}"`);
    }

    res.json({
      message: 'Lista de ocorrências do prestador',
      prestador: {
        id: prestador.id,
        nome: prestador.nome,
        email: prestador.email
      },
      ocorrencias: ocorrencias,
      total: ocorrencias.length
    });
  } catch (error) {
    console.error('❌ Erro ao obter ocorrências do prestador:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      user: req.user
    });
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

// Endpoint para finalizar ocorrência
router.post('/prestador/ocorrencias/:id/finalizar', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.tipo !== 'prestador') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const { id } = req.params;
    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Buscar a ocorrência
    const ocorrencia = await db.ocorrencia.findUnique({
      where: { id: Number(id) }
    });

    if (!ocorrencia) {
      return res.status(404).json({ message: 'Ocorrência não encontrada' });
    }

    // Atualizar status da ocorrência
    await db.ocorrencia.update({
      where: { id: Number(id) },
      data: { 
        status: 'concluida',
        termino: new Date()
      }
    });

    res.json({ message: 'Ocorrência finalizada com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao finalizar ocorrência:', error);
    res.status(500).json({ message: 'Erro ao finalizar ocorrência' });
  }
});

// Endpoint para buscar ocorrências finalizadas do prestador autenticado
router.get('/prestador/ocorrencias-finalizadas', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Prestador não autenticado' });
    }
    if (user.tipo !== 'prestador') {
      return res.status(403).json({ message: 'Acesso negado. Apenas prestadores podem acessar esta rota.' });
    }

    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Buscar o UsuarioPrestador para obter o prestador_id
    const usuarioPrestador = await db.usuarioPrestador.findUnique({
      where: { id: user.id }
    });
    if (!usuarioPrestador) {
      return res.status(404).json({ message: 'Usuário prestador não encontrado' });
    }

    // Buscar o prestador usando o prestador_id
    const prestador = await db.prestador.findUnique({
      where: { id: usuarioPrestador.prestador_id }
    });
    if (!prestador) {
      return res.status(404).json({ message: 'Prestador não encontrado' });
    }

    console.log(`✅ Buscando ocorrências finalizadas para o prestador: ${prestador.nome} (ID: ${prestador.id})`);

    // Buscar ocorrências finalizadas usando verificação rigorosa
    // Só retornar ocorrências onde o campo 'prestador' corresponde EXATAMENTE ao nome do prestador logado
    const ocorrencias = await db.ocorrencia.findMany({
      where: {
        AND: [
          {
            prestador: prestador.nome // Busca exata pelo nome do prestador
          },
          {
            status: {
              in: ['concluida', 'cancelada']
            }
          }
        ]
      },
      orderBy: {
        termino: 'desc'
      },
      select: {
        id: true,
        placa1: true,
        placa2: true,
        placa3: true,
        modelo1: true,
        cor1: true,
        cliente: true,
        tipo: true,
        tipo_veiculo: true,
        coordenadas: true,
        endereco: true,
        bairro: true,
        cidade: true,
        estado: true,
        cpf_condutor: true,
        nome_condutor: true,
        transportadora: true,
        valor_carga: true,
        notas_fiscais: true,
        os: true,
        origem_bairro: true,
        origem_cidade: true,
        origem_estado: true,
        prestador: true,
        operador: true,
        inicio: true,
        chegada: true,
        termino: true,
        km: true,
        despesas: true,
        descricao: true,
        resultado: true,
        status: true,
        encerrada_em: true,
        criado_em: true,
        atualizado_em: true,
        data_acionamento: true,
        km_final: true,
        km_inicial: true,
        despesas_detalhadas: true,
        passagem_servico: true,
        planta_origem: true,
        cidade_destino: true,
        km_acl: true,
        operacao: true,
        hashRastreamento: true
      }
    });

    console.log(`✅ Ocorrências finalizadas encontradas para o prestador "${prestador.nome}": ${ocorrencias.length}`);

    // Log detalhado das ocorrências encontradas para debug
    if (ocorrencias.length > 0) {
      console.log('📋 Ocorrências finalizadas vinculadas ao prestador:');
      ocorrencias.forEach(oc => {
        console.log(`   - ID: ${oc.id}, Status: ${oc.status}, Prestador: "${oc.prestador}"`);
      });
    } else {
      console.log(`⚠️ Nenhuma ocorrência finalizada encontrada para o prestador "${prestador.nome}"`);
    }

    // Adicionar os valores do prestador em cada ocorrência
    const ocorrenciasComValores = ocorrencias.map(oc => ({
      ...oc,
      valor_acionamento: prestador.valor_acionamento,
      valor_hora_adc: prestador.valor_hora_adc,
      valor_km_adc: prestador.valor_km_adc
    }));

    res.json(ocorrenciasComValores);
  } catch (error) {
    console.error('❌ Erro ao buscar ocorrências finalizadas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Endpoint para logout do prestador
router.post('/prestador/logout', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.tipo !== 'prestador') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    // Em uma implementação real, você poderia invalidar o token
    // Por enquanto, apenas retornamos sucesso
    res.json({ message: 'Logout realizado com sucesso!' });
  } catch (error) {
    console.error('❌ Erro no logout do prestador:', error);
    res.status(500).json({ message: 'Erro ao fazer logout' });
  }
});

// Endpoint para obter perfil do prestador
router.get('/prestador/perfil', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.tipo !== 'prestador') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }

    // Buscar o UsuarioPrestador para obter o prestador_id
    const usuarioPrestador = await db.usuarioPrestador.findUnique({
      where: { id: user.id }
    });
    
    if (!usuarioPrestador) {
      return res.status(404).json({ message: 'Usuário prestador não encontrado' });
    }

    // Buscar o prestador usando o prestador_id
    const prestador = await db.prestador.findUnique({
      where: { id: usuarioPrestador.prestador_id }
    });
    
    if (!prestador) {
      return res.status(404).json({ message: 'Prestador não encontrado' });
    }

    res.json({
      id: prestador.id,
      nome: prestador.nome,
      email: usuarioPrestador.email,
      telefone: prestador.telefone,
      cidade: prestador.cidade,
      estado: prestador.estado,
      bairro: prestador.bairro,
      endereco: prestador.endereco,
      cep: prestador.cep,
      valor_acionamento: prestador.valor_acionamento,
      valor_hora_adc: prestador.valor_hora_adc,
      valor_km_adc: prestador.valor_km_adc,
      franquia_km: prestador.franquia_km,
      franquia_horas: prestador.franquia_horas
    });
  } catch (error) {
    console.error('❌ Erro ao obter perfil do prestador:', error);
    res.status(500).json({ message: 'Erro ao obter perfil' });
  }
});

// Endpoint para alteração de senha do prestador (corrigido)
router.post('/prestador/change-password', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.tipo !== 'prestador') {
      return res.status(403).json({ message: 'Acesso negado' });
    }
    
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }
    
    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ message: 'Erro de conexão com o banco de dados' });
    }
    
    // Buscar usuário prestador
    const usuarioPrestador = await db.usuarioPrestador.findUnique({ 
      where: { id: user.id } 
    });
    
    if (!usuarioPrestador) {
      return res.status(404).json({ message: 'Usuário prestador não encontrado' });
    }
    
    // Verificar senha atual
    const bcrypt = require('bcryptjs');
    const senhaCorreta = await bcrypt.compare(currentPassword, usuarioPrestador.senha_hash);
    
    if (!senhaCorreta) {
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }
    
    // Atualizar senha
    const novaSenhaHash = await bcrypt.hash(newPassword, 10);
    await db.usuarioPrestador.update({
      where: { id: user.id },
      data: { senha_hash: novaSenhaHash }
    });
    
    res.json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao alterar senha do prestador:', error);
    res.status(500).json({ message: 'Erro ao alterar senha' });
  }
});

export default router; 