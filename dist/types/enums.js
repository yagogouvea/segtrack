"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegiaoContratoEnum = exports.TipoContratoEnum = exports.UserRoleEnum = exports.OcorrenciaStatusEnum = void 0;
exports.OcorrenciaStatusEnum = {
    em_andamento: 'em_andamento',
    concluida: 'concluida',
    cancelada: 'cancelada',
    aguardando: 'aguardando'
};
exports.UserRoleEnum = {
    admin: 'admin',
    manager: 'manager',
    operator: 'operator',
    client: 'client'
};
exports.TipoContratoEnum = {
    padrao_regiao: 'padrao_regiao',
    acl_km: 'acl_km',
    padrao_fixo: 'padrao_fixo',
    valor_fechado: 'valor_fechado'
};
exports.RegiaoContratoEnum = {
    CAPITAL: 'CAPITAL',
    GRANDE_SP: 'GRANDE_SP',
    INTERIOR: 'INTERIOR',
    OUTROS_ESTADOS: 'OUTROS_ESTADOS'
};
