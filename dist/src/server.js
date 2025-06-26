"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./config/logger"));
const port = parseInt(process.env.PORT || '3001', 10);
// Função para inicializar o servidor
const startServer = async () => {
    try {
        const server = app_1.default.listen(port, '0.0.0.0', () => {
            logger_1.default.info(`🚀 Servidor iniciado em http://0.0.0.0:${port}`);
            logger_1.default.info(`Ambiente: ${process.env.NODE_ENV}`);
            const used = process.memoryUsage();
            logger_1.default.info({
                rss: used.rss,
                heapTotal: used.heapTotal,
                heapUsed: used.heapUsed,
                external: used.external,
                arrayBuffers: used.arrayBuffers
            }, 'Memória em uso');
        });
        // Configurar timeouts do servidor
        server.keepAliveTimeout = 620 * 1000; // 620 segundos
        server.headersTimeout = 621 * 1000; // Ligeiramente maior que keepAliveTimeout
        // Tratamento de sinais para shutdown graceful
        const shutdown = async () => {
            console.log('Iniciando shutdown graceful...');
            server.close(async (err) => {
                if (err) {
                    console.error('Erro ao fechar o servidor:', err);
                    process.exit(1);
                }
                console.log('Servidor fechado com sucesso');
                process.exit(0);
            });
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
    catch (error) {
        console.error('❌ Erro ao iniciar o servidor:', error);
        process.exit(1);
    }
};
// Iniciar o servidor
startServer().catch((error) => {
    console.error('❌ Erro fatal ao iniciar o servidor:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map