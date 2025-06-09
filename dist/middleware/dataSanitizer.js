"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeOcorrenciaData = void 0;
exports.sanitizeResponseData = sanitizeResponseData;
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
function sanitizeResponseData() {
    return (req, res, next) => {
        // Sanitizar dados da requisição
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = req.body[key]
                        .replace(/[<>]/g, '') // Remove tags HTML
                        .trim();
                }
            });
        }
        // Sanitizar dados da resposta
        const originalSend = res.send;
        res.send = function (data) {
            if (typeof data === 'string') {
                data = data.replace(/[<>]/g, '').trim();
            }
            else if (typeof data === 'object' && data !== null) {
                data = JSON.parse(JSON.stringify(data).replace(/[<>]/g, ''));
            }
            return originalSend.call(this, data);
        };
        next();
    };
}
