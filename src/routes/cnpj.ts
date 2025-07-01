import express, { Router, Request, Response } from 'express';
import axios from 'axios';

interface CNPJResponse {
  company?: {
    name: string;
    fantasy_name?: string;
    legal_nature?: string;
    cnae_main?: string;
    situation?: string;
    registration_date?: string;
  };
  address?: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zip?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
}

const router: Router = express.Router();

router.get('/:cnpj', async (req: Request, res: Response) => {
  const { cnpj } = req.params;

  // Limpar CNPJ (remover caracteres não numéricos)
  const cnpjLimpo = cnpj.replace(/\D/g, '');

  // Validar formato do CNPJ
  if (cnpjLimpo.length !== 14) {
    return res.status(400).json({ error: 'CNPJ inválido. Deve conter 14 dígitos.' });
  }

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpjLimpo)) {
    return res.status(400).json({ error: 'CNPJ inválido.' });
  }

  if (!process.env.API_BRASIL_DEVICE || !process.env.API_BRASIL_BEARER) {
    return res.status(500).json({ error: 'Tokens da API Brasil não configurados' });
  }

  try {
    console.log('🔍 Consultando CNPJ na API Brasil:', cnpjLimpo);
    
    const response = await axios.post(
      'https://gateway.apibrasil.io/api/v2/companies/cnpj',
      { cnpj: cnpjLimpo },
      {
        headers: {
          'Content-Type': 'application/json',
          'DeviceToken': process.env.API_BRASIL_DEVICE,
          'Authorization': `Bearer ${process.env.API_BRASIL_BEARER}`
        }
      }
    );

    const dados = response.data?.response;
    console.log('✅ Dados recebidos da API Brasil:', dados);

    if (!dados?.nome) {
      return res.status(404).json({ error: 'CNPJ não encontrado' });
    }

    // Formatar resposta conforme interface CNPJResponse
    const formattedResponse: CNPJResponse = {
      company: {
        name: dados.nome || '',
        fantasy_name: dados.nome_fantasia,
        legal_nature: dados.natureza_juridica,
        cnae_main: dados.cnae_principal,
        situation: dados.situacao,
        registration_date: dados.data_abertura
      },
      address: {
        street: dados.logradouro || '',
        number: dados.numero || '',
        complement: dados.complemento,
        district: dados.bairro || '',
        city: dados.municipio || '',
        state: dados.uf || '',
        zip: dados.cep
      },
      contact: {
        phone: dados.telefone,
        email: dados.email
      }
    };

    return res.json(formattedResponse);
  } catch (err: any) {
    console.error('❌ Erro ao consultar CNPJ:', err);
    
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'CNPJ não encontrado' });
    }
    
    if (err.response?.status === 429) {
      return res.status(429).json({ error: 'Muitas consultas. Aguarde alguns segundos.' });
    }
    
    return res.status(500).json({ error: 'Erro ao consultar CNPJ' });
  }
});

export default router; 