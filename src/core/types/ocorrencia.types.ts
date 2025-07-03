import { Prisma } from '@prisma/client';

export type CreateOcorrenciaDTO = {
  placa1: string;
  placa2?: string;
  placa3?: string;
  modelo1?: string;
  cor1?: string;
  cliente: string;
  tipo: string;
  tipo_veiculo?: string;
  coordenadas?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cpf_condutor?: string;
  nome_condutor?: string;
  transportadora?: string;
  valor_carga?: number;
  notas_fiscais?: string;
  os?: string;
  origem_bairro?: string;
  origem_cidade?: string;
  origem_estado?: string;
  prestador?: string;
  operador?: string;
  inicio?: Date;
  chegada?: Date;
  termino?: Date;
  km?: number;
  despesas?: number;
  descricao?: string;
  resultado?: string;
  status?: string;
  data_acionamento?: Date;
  km_final?: number;
  km_inicial?: number;
  despesas_detalhadas?: Prisma.JsonValue;
  passagem_servico?: string;
};

export type UpdateOcorrenciaDTO = Partial<CreateOcorrenciaDTO>;

export type OcorrenciaStatus = 
  | 'Em andamento'
  | 'Finalizada'
  | 'Cancelada'
  | 'Aguardando prestador'; 