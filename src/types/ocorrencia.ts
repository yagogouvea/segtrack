import { Prisma } from '@prisma/client';

export interface Foto {
  id?: number;
  url: string;
  legenda: string;
  ocorrenciaId: number;
  createdAt?: Date;
}

export interface Ocorrencia {
  id: number;
  placa1: string;
  placa2?: string | null;
  placa3?: string | null;
  modelo1?: string | null;
  cor1?: string | null;
  cliente: string;
  tipo: string;
  tipo_veiculo?: string | null;
  coordenadas?: string | null;
  endereco?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cpf_condutor?: string | null;
  nome_condutor?: string | null;
  transportadora?: string | null;
  valor_carga?: number | null;
  notas_fiscais?: string | null;
  os?: string | null;
  origem_bairro?: string | null;
  origem_cidade?: string | null;
  origem_estado?: string | null;
  prestador?: string | null;
  inicio?: Date | null;
  chegada?: Date | null;
  termino?: Date | null;
  km?: number | null;
  km_inicial?: number | null;
  km_final?: number | null;
  despesas?: number | null;
  despesas_detalhadas?: Prisma.JsonValue | null;
  descricao?: string | null;
  resultado?: string | null;
  status: string;
  encerrada_em?: Date | null;
  criado_em: Date;
  atualizado_em: Date;
  data_acionamento?: Date | null;
  fotos?: Foto[];
  // ✅ NOVOS CAMPOS DO CLIENTE
  cliente_logo?: string | null;
  cliente_nome_fantasia?: string | null;
}

export interface OcorrenciaFormatada extends Omit<Ocorrencia, 'inicio' | 'chegada' | 'termino' | 'encerrada_em'> {
  inicio: string | null;
  chegada: string | null;
  termino: string | null;
  encerradaEm: Date | null | undefined;
  tem_fotos: boolean;
} 