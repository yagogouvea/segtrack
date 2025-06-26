export const OcorrenciaStatusEnum = {
  em_andamento: 'em_andamento',
  concluida: 'concluida',
  cancelada: 'cancelada',
  aguardando: 'aguardando'
} as const;

export const UserRoleEnum = {
  admin: 'admin',
  manager: 'manager',
  operator: 'operator',
  client: 'client'
} as const;

export const TipoContratoEnum = {
  padrao_regiao: 'padrao_regiao',
  acl_km: 'acl_km',
  padrao_fixo: 'padrao_fixo',
  valor_fechado: 'valor_fechado'
} as const;

export const RegiaoContratoEnum = {
  CAPITAL: 'CAPITAL',
  GRANDE_SP: 'GRANDE_SP',
  INTERIOR: 'INTERIOR',
  OUTROS_ESTADOS: 'OUTROS_ESTADOS'
} as const; 