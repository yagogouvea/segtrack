import app from './app';

const port = parseInt(process.env.PORT || '8080', 10);
const host = process.env.HOST || '0.0.0.0';

// Função para inicializar o servidor
const startServer = async () => {
  try {
    const server = app.listen(port, host, () => {
      console.log(`🚀 Servidor iniciado em http://${host}:${port}`);
      console.log('Ambiente:', process.env.NODE_ENV);
      console.log('Memória em uso:', process.memoryUsage());
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

  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Iniciar o servidor
startServer().catch((error) => {
  console.error('❌ Erro fatal ao iniciar o servidor:', error);
  process.exit(1);
}); 