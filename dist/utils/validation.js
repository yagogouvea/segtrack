"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnum = exports.validateRequiredFields = exports.validateId = void 0;
exports.validateUserData = validateUserData;
exports.validateCNPJ = validateCNPJ;
exports.validateCPF = validateCPF;
exports.validatePlaca = validatePlaca;
exports.validateTelefone = validateTelefone;
exports.validateCEP = validateCEP;
const response_1 = require("./response");
const client_1 = require("@prisma/client");
const validateId = (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        response_1.sendResponse.badRequest(res, 'ID inválido');
        return;
    }
    next();
};
exports.validateId = validateId;
const validateRequiredFields = (fields) => {
    return (req, res, next) => {
        const missingFields = fields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            response_1.sendResponse.badRequest(res, `Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
            return;
        }
        next();
    };
};
exports.validateRequiredFields = validateRequiredFields;
const validateEnum = (field, enumType) => {
    return (req, res, next) => {
        const value = req.body[field];
        const validValues = Object.values(enumType);
        if (value && !validValues.includes(value)) {
            response_1.sendResponse.badRequest(res, `Valor inválido para o campo ${field}. Valores permitidos: ${validValues.join(', ')}`);
            return;
        }
        next();
    };
};
exports.validateEnum = validateEnum;
/**
 * Valida os dados de um usuário
 * @param data Os dados do usuário a serem validados
 * @returns Uma mensagem de erro se houver algum problema, undefined caso contrário
 */
function validateUserData(data) {
    // Validar email
    if (!data.email) {
        return 'Email é obrigatório';
    }
    if (!isValidEmail(data.email)) {
        return 'Email inválido';
    }
    // Validar senha
    if (!data.passwordHash) {
        return 'Senha é obrigatória';
    }
    if (data.passwordHash.length < 6) {
        return 'Senha deve ter pelo menos 6 caracteres';
    }
    // Validar nome
    if (!data.name) {
        return 'Nome é obrigatório';
    }
    if (data.name.length < 3) {
        return 'Nome deve ter pelo menos 3 caracteres';
    }
    // Validar role
    if (!data.role) {
        return 'Role é obrigatória';
    }
    if (!isValidRole(data.role)) {
        return 'Role inválida';
    }
    return undefined;
}
/**
 * Valida um endereço de email
 * @param email O endereço de email a ser validado
 * @returns true se o email é válido, false caso contrário
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Verifica se uma role é válida
 * @param role A role a ser verificada
 * @returns true se a role é válida, false caso contrário
 */
function isValidRole(role) {
    return Object.values(client_1.UserRole).includes(role);
}
/**
 * Valida um CNPJ
 * @param cnpj O CNPJ a ser validado
 * @returns true se o CNPJ é válido, false caso contrário
 */
function validateCNPJ(cnpj) {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');
    // Verifica o tamanho
    if (cnpj.length !== 14) {
        return false;
    }
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) {
        return false;
    }
    // Validação do primeiro dígito verificador
    let soma = 0;
    let peso = 5;
    for (let i = 0; i < 12; i++) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
    }
    let digito = 11 - (soma % 11);
    if (digito > 9)
        digito = 0;
    if (parseInt(cnpj.charAt(12)) !== digito) {
        return false;
    }
    // Validação do segundo dígito verificador
    soma = 0;
    peso = 6;
    for (let i = 0; i < 13; i++) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 2 ? 9 : peso - 1;
    }
    digito = 11 - (soma % 11);
    if (digito > 9)
        digito = 0;
    if (parseInt(cnpj.charAt(13)) !== digito) {
        return false;
    }
    return true;
}
/**
 * Valida um CPF
 * @param cpf O CPF a ser validado
 * @returns true se o CPF é válido, false caso contrário
 */
function validateCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    // Verifica o tamanho
    if (cpf.length !== 11) {
        return false;
    }
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) {
        return false;
    }
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digito = 11 - (soma % 11);
    if (digito > 9)
        digito = 0;
    if (parseInt(cpf.charAt(9)) !== digito) {
        return false;
    }
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digito = 11 - (soma % 11);
    if (digito > 9)
        digito = 0;
    if (parseInt(cpf.charAt(10)) !== digito) {
        return false;
    }
    return true;
}
/**
 * Valida uma placa de veículo (formato antigo e Mercosul)
 * @param placa A placa a ser validada
 * @returns true se a placa é válida, false caso contrário
 */
function validatePlaca(placa) {
    // Remove espaços e traços
    placa = placa.replace(/[\s-]/g, '').toUpperCase();
    // Formato antigo: ABC1234
    const formatoAntigo = /^[A-Z]{3}[0-9]{4}$/;
    // Formato Mercosul: ABC1D23
    const formatoMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    return formatoAntigo.test(placa) || formatoMercosul.test(placa);
}
/**
 * Valida um número de telefone
 * @param telefone O número de telefone a ser validado
 * @returns true se o telefone é válido, false caso contrário
 */
function validateTelefone(telefone) {
    // Remove caracteres não numéricos
    telefone = telefone.replace(/[^\d]/g, '');
    // Verifica se tem 10 (fixo) ou 11 (celular) dígitos
    if (telefone.length !== 10 && telefone.length !== 11) {
        return false;
    }
    // Verifica DDD válido (11-99)
    const ddd = parseInt(telefone.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
        return false;
    }
    // Se for celular (11 dígitos), verifica se começa com 9
    if (telefone.length === 11 && telefone.charAt(2) !== '9') {
        return false;
    }
    return true;
}
/**
 * Valida um CEP
 * @param cep O CEP a ser validado
 * @returns true se o CEP é válido, false caso contrário
 */
function validateCEP(cep) {
    // Remove caracteres não numéricos
    cep = cep.replace(/[^\d]/g, '');
    // Verifica se tem 8 dígitos
    if (cep.length !== 8) {
        return false;
    }
    // Verifica se não são todos zeros
    if (/^0+$/.test(cep)) {
        return false;
    }
    return true;
}
