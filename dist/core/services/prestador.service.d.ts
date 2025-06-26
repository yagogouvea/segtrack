interface PrestadorData {
    nome: string;
    cpf: string;
    cod_nome: string;
    telefone: string;
    email: string;
    tipo_pix: string;
    chave_pix: string;
    cep: string;
    endereco: string;
    bairro: string;
    cidade: string;
    estado: string;
    valor_acionamento: number;
    franquia_horas: string;
    franquia_km: number;
    valor_hora_adc: number;
    valor_km_adc: number;
    aprovado: boolean;
    funcoes: {
        funcao: string;
    }[];
    veiculos: {
        tipo: string;
    }[];
    regioes: {
        regiao: string;
    }[];
}
export declare class PrestadorService {
    list(): Promise<({
        funcoes: {
            id: number;
            funcao: string;
            prestadorId: number;
        }[];
        regioes: {
            id: number;
            regiao: string;
            prestadorId: number;
        }[];
        veiculos: {
            id: number;
            tipo: string;
            prestadorId: number;
        }[];
    } & {
        id: number;
        email: string | null;
        nome: string;
        cpf: string;
        cod_nome: string | null;
        telefone: string | null;
        aprovado: boolean;
        tipo_pix: string | null;
        chave_pix: string | null;
        cep: string | null;
        endereco: string | null;
        bairro: string | null;
        cidade: string | null;
        estado: string | null;
        valor_acionamento: number | null;
        franquia_horas: string | null;
        franquia_km: number | null;
        valor_hora_adc: number | null;
        valor_km_adc: number | null;
        criado_em: Date;
        origem: string | null;
    })[]>;
    listPublic(): Promise<({
        funcoes: {
            id: number;
            funcao: string;
            prestadorId: number;
        }[];
        regioes: {
            id: number;
            regiao: string;
            prestadorId: number;
        }[];
        veiculos: {
            id: number;
            tipo: string;
            prestadorId: number;
        }[];
    } & {
        id: number;
        email: string | null;
        nome: string;
        cpf: string;
        cod_nome: string | null;
        telefone: string | null;
        aprovado: boolean;
        tipo_pix: string | null;
        chave_pix: string | null;
        cep: string | null;
        endereco: string | null;
        bairro: string | null;
        cidade: string | null;
        estado: string | null;
        valor_acionamento: number | null;
        franquia_horas: string | null;
        franquia_km: number | null;
        valor_hora_adc: number | null;
        valor_km_adc: number | null;
        criado_em: Date;
        origem: string | null;
    })[]>;
    findById(id: number): Promise<{
        funcoes: {
            id: number;
            funcao: string;
            prestadorId: number;
        }[];
        regioes: {
            id: number;
            regiao: string;
            prestadorId: number;
        }[];
        veiculos: {
            id: number;
            tipo: string;
            prestadorId: number;
        }[];
    } & {
        id: number;
        email: string | null;
        nome: string;
        cpf: string;
        cod_nome: string | null;
        telefone: string | null;
        aprovado: boolean;
        tipo_pix: string | null;
        chave_pix: string | null;
        cep: string | null;
        endereco: string | null;
        bairro: string | null;
        cidade: string | null;
        estado: string | null;
        valor_acionamento: number | null;
        franquia_horas: string | null;
        franquia_km: number | null;
        valor_hora_adc: number | null;
        valor_km_adc: number | null;
        criado_em: Date;
        origem: string | null;
    }>;
    create(data: PrestadorData): Promise<{
        funcoes: {
            id: number;
            funcao: string;
            prestadorId: number;
        }[];
        regioes: {
            id: number;
            regiao: string;
            prestadorId: number;
        }[];
        veiculos: {
            id: number;
            tipo: string;
            prestadorId: number;
        }[];
    } & {
        id: number;
        email: string | null;
        nome: string;
        cpf: string;
        cod_nome: string | null;
        telefone: string | null;
        aprovado: boolean;
        tipo_pix: string | null;
        chave_pix: string | null;
        cep: string | null;
        endereco: string | null;
        bairro: string | null;
        cidade: string | null;
        estado: string | null;
        valor_acionamento: number | null;
        franquia_horas: string | null;
        franquia_km: number | null;
        valor_hora_adc: number | null;
        valor_km_adc: number | null;
        criado_em: Date;
        origem: string | null;
    }>;
    update(id: number, data: PrestadorData): Promise<{
        funcoes: {
            id: number;
            funcao: string;
            prestadorId: number;
        }[];
        regioes: {
            id: number;
            regiao: string;
            prestadorId: number;
        }[];
        veiculos: {
            id: number;
            tipo: string;
            prestadorId: number;
        }[];
    } & {
        id: number;
        email: string | null;
        nome: string;
        cpf: string;
        cod_nome: string | null;
        telefone: string | null;
        aprovado: boolean;
        tipo_pix: string | null;
        chave_pix: string | null;
        cep: string | null;
        endereco: string | null;
        bairro: string | null;
        cidade: string | null;
        estado: string | null;
        valor_acionamento: number | null;
        franquia_horas: string | null;
        franquia_km: number | null;
        valor_hora_adc: number | null;
        valor_km_adc: number | null;
        criado_em: Date;
        origem: string | null;
    }>;
    delete(id: number): Promise<void>;
    findByRegiao(regiao: string): Promise<({
        funcoes: {
            id: number;
            funcao: string;
            prestadorId: number;
        }[];
        regioes: {
            id: number;
            regiao: string;
            prestadorId: number;
        }[];
        veiculos: {
            id: number;
            tipo: string;
            prestadorId: number;
        }[];
    } & {
        id: number;
        email: string | null;
        nome: string;
        cpf: string;
        cod_nome: string | null;
        telefone: string | null;
        aprovado: boolean;
        tipo_pix: string | null;
        chave_pix: string | null;
        cep: string | null;
        endereco: string | null;
        bairro: string | null;
        cidade: string | null;
        estado: string | null;
        valor_acionamento: number | null;
        franquia_horas: string | null;
        franquia_km: number | null;
        valor_hora_adc: number | null;
        valor_km_adc: number | null;
        criado_em: Date;
        origem: string | null;
    })[]>;
    findByFuncao(funcao: string): Promise<({
        funcoes: {
            id: number;
            funcao: string;
            prestadorId: number;
        }[];
        regioes: {
            id: number;
            regiao: string;
            prestadorId: number;
        }[];
        veiculos: {
            id: number;
            tipo: string;
            prestadorId: number;
        }[];
    } & {
        id: number;
        email: string | null;
        nome: string;
        cpf: string;
        cod_nome: string | null;
        telefone: string | null;
        aprovado: boolean;
        tipo_pix: string | null;
        chave_pix: string | null;
        cep: string | null;
        endereco: string | null;
        bairro: string | null;
        cidade: string | null;
        estado: string | null;
        valor_acionamento: number | null;
        franquia_horas: string | null;
        franquia_km: number | null;
        valor_hora_adc: number | null;
        valor_km_adc: number | null;
        criado_em: Date;
        origem: string | null;
    })[]>;
}
export {};
//# sourceMappingURL=prestador.service.d.ts.map