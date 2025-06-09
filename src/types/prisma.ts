import { Prisma } from '@prisma/client';

export type OcorrenciaStatus = 'em_andamento' | 'concluida' | 'cancelada' | 'aguardando';

export type CreateOcorrenciaDTO = {
  status?: OcorrenciaStatus;
  tipo: string;
  cliente: string;
  placa1: string;
  placa2?: string;
  placa3?: string;
  despesas_detalhadas?: Prisma.JsonValue;
  fotos?: {
    url: string;
    legenda?: string;
  }[];
};

export type UpdateOcorrenciaDTO = Partial<CreateOcorrenciaDTO>;

export type CreateUserDTO = {
  nome: string;
  email: string;
  senha: string;
  role?: string;
};

export type UpdateUserDTO = Partial<CreateUserDTO>; 