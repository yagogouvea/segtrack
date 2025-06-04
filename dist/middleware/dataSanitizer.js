"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeResponseData = exports.sanitizeOcorrenciaData = void 0;
const sanitizeOcorrenciaData = (data) => {
    return {
        id: data.id,
        tipo: data.tipo,
        status: data.status,
        data_acionamento: data.data_acionamento,
        cliente: data.cliente,
        tipo_veiculo: data.tipo_veiculo,
        coordenadas: data.coordenadas
    };
};
exports.sanitizeOcorrenciaData = sanitizeOcorrenciaData;
const sanitizeResponseData = () => {
    return (req, res, next) => {
        const originalJson = res.json;
        res.json = function (data) {
            // Se a rota contém 'ocorrencias', sanitiza os dados
            if (req.path.includes('ocorrencias')) {
                if (Array.isArray(data)) {
                    data = data.map(item => (0, exports.sanitizeOcorrenciaData)(item));
                }
                else if (data && typeof data === 'object') {
                    data = (0, exports.sanitizeOcorrenciaData)(data);
                }
            }
            // Remove campos sensíveis gerais
            if (data && typeof data === 'object') {
                const sensitiveFields = [
                    'senha', 'password', 'token', 'secret',
                    'placa1', 'placa2', 'placa3', 'placa4',
                    'cpf', 'rg', 'telefone', 'email',
                    'chave_pix', 'endereco'
                ];
                const removeSensitiveData = (obj) => {
                    if (Array.isArray(obj)) {
                        return obj.map(item => removeSensitiveData(item));
                    }
                    if (obj && typeof obj === 'object') {
                        const sanitized = { ...obj };
                        sensitiveFields.forEach(field => {
                            if (field in sanitized) {
                                if (typeof sanitized[field] === 'string') {
                                    // Mascara parcialmente os dados sensíveis
                                    sanitized[field] = sanitized[field].replace(/./g, '*');
                                }
                                else {
                                    delete sanitized[field];
                                }
                            }
                        });
                        return sanitized;
                    }
                    return obj;
                };
                data = removeSensitiveData(data);
            }
            return originalJson.call(this, data);
        };
        next();
    };
};
exports.sanitizeResponseData = sanitizeResponseData;
