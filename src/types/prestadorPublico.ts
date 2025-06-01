// src/types/prestadorPublico.ts

export interface PrestadorPublicoInput {
  nome: string;
  cpf: string;
  cod_nome: string; // Codinome: como gostaria de ser chamado
  telefone: string; // Ex: 11 91234-5678
  email: string;    // Ex: nome@exemplo.com
  tipo_pix: string; // CPF, CNPJ, E-mail, Telefone
  chave_pix: string;
  cep: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  funcoes: string[];     // Ex: ['Pronta Resposta', 'Drone']
  regioes: string[];     // Localidades de atuação
  tipo_veiculo: string[]; // Ex: ['Carro', 'Moto']
}

// Dica adicional: você pode expandir esse tipo para incluir validações com Zod ou Joi futuramente.
// Exemplo com Zod:
// import { z } from 'zod';
// export const PrestadorPublicoSchema = z.object({ nome: z.string(), ... });
