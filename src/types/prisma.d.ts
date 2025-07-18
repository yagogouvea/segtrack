import { Prisma } from '@prisma/client';
import { OcorrenciaStatusEnum, UserRoleEnum, TipoContratoEnum, RegiaoContratoEnum } from './enums';

export type OcorrenciaStatus = 'em_andamento' | 'concluida' | 'cancelada' | 'aguardando';
export type UserRole = 'admin' | 'manager' | 'operator' | 'client';
export type TipoContrato = keyof typeof TipoContratoEnum;
export type RegiaoContrato = keyof typeof RegiaoContratoEnum;

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: Prisma.JsonValue;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: UserRole;
  permissions?: Prisma.JsonValue;
  active?: boolean;
}

export type CreateOcorrenciaDTO = {
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
  operador?: string | null;
  operacao?: string | null;
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
  status?: OcorrenciaStatus;
  data_acionamento?: Date | null;
  fotos?: { url: string; legenda?: string }[];
};

export type UpdateOcorrenciaDTO = Partial<CreateOcorrenciaDTO>;

export {}; 