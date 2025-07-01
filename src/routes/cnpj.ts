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

  // Tokens da API Brasil são opcionais agora, pois temos fallbacks gratuitos

  try {
    console.log('🔍 Consultando CNPJ:', cnpjLimpo);
    
    // Tentar primeiro com API Brasil se os tokens estiverem configurados
    if (process.env.API_BRASIL_DEVICE && process.env.API_BRASIL_BEARER) {
      try {
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

        if (dados?.nome) {
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
        }
      } catch (apiError: any) {
        console.log('⚠️ Erro na API Brasil, tentando API pública:', apiError.message);
      }
    }

    // Fallback para API pública gratuita (BrasilAPI)
    try {
      const publicResponse = await axios.get(
        `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`,
        {
          timeout: 10000
        }
      );

      const dados = publicResponse.data;
      console.log('✅ Dados recebidos da BrasilAPI:', dados);

      if (!dados?.razao_social) {
        return res.status(404).json({ error: 'CNPJ não encontrado' });
      }

      // Formatar resposta conforme interface CNPJResponse
      const formattedResponse: CNPJResponse = {
        company: {
          name: dados.razao_social || '',
          fantasy_name: dados.nome_fantasia,
          legal_nature: dados.natureza_juridica,
          cnae_main: dados.cnae_principal,
          situation: dados.descricao_situacao_cadastral,
          registration_date: dados.data_inicio_atividade
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
          phone: dados.ddd_telefone_1 ? `${dados.ddd_telefone_1}${dados.telefone_1}` : undefined,
          email: dados.email
        }
      };

      return res.json(formattedResponse);
    } catch (brasilApiError: any) {
      console.log('⚠️ Erro na BrasilAPI, tentando API alternativa:', brasilApiError.message);
      
      // Segunda opção: API gratuita alternativa
      try {
        const alternativeResponse = await axios.get(
          `https://publica.cnpj.ws/cnpj/${cnpjLimpo}`,
          {
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );

        const dados = alternativeResponse.data;
        console.log('✅ Dados recebidos da API alternativa:', dados);

        if (!dados?.empresa?.nome) {
          return res.status(404).json({ error: 'CNPJ não encontrado' });
        }

        // Formatar resposta conforme interface CNPJResponse
        const formattedResponse: CNPJResponse = {
          company: {
            name: dados.empresa.nome || '',
            fantasy_name: dados.empresa.nome_fantasia,
            legal_nature: dados.empresa.natureza_juridica,
            cnae_main: dados.empresa.cnae_principal,
            situation: dados.empresa.situacao,
            registration_date: dados.empresa.data_abertura
          },
          address: {
            street: dados.estabelecimento.logradouro || '',
            number: dados.estabelecimento.numero || '',
            complement: dados.estabelecimento.complemento,
            district: dados.estabelecimento.bairro || '',
            city: dados.estabelecimento.cidade || '',
            state: dados.estabelecimento.estado || '',
            zip: dados.estabelecimento.cep
          },
          contact: {
            phone: dados.estabelecimento.telefone1,
            email: dados.estabelecimento.email
          }
        };

        return res.json(formattedResponse);
      } catch (alternativeError: any) {
        console.log('⚠️ Erro na API alternativa:', alternativeError.message);
        
        // Terceira opção: API mais simples
        try {
          const simpleResponse = await axios.get(
            `https://api.cnpjs.rocks/${cnpjLimpo}`,
            {
              timeout: 10000
            }
          );

          const dados = simpleResponse.data;
          console.log('✅ Dados recebidos da API simples:', dados);

          if (!dados?.nome) {
            return res.status(404).json({ error: 'CNPJ não encontrado' });
          }

          // Formatar resposta conforme interface CNPJResponse
          const formattedResponse: CNPJResponse = {
            company: {
              name: dados.nome || '',
              fantasy_name: dados.fantasia,
              legal_nature: dados.natureza_juridica,
              cnae_main: dados.cnae,
              situation: dados.situacao,
              registration_date: dados.abertura
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
        } catch (simpleError: any) {
          console.log('⚠️ Erro na API simples:', simpleError.message);
          throw new Error('Todas as APIs de consulta CNPJ falharam');
        }
      }
    }
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