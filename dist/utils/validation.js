"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnum = exports.validateRequiredFields = exports.validateId = void 0;
const response_1 = require("./response");
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
//# sourceMappingURL=validation.js.map