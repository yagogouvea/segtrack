import 'dotenv/config';
import app from '@/app';
import { testConnection } from './lib/prisma';

const port = parseInt(process.env.PORT || '8080', 10);
const host = process.env.HOST || '0.0.0.0';

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'definida' : 'NÃO definida');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'definida' : 'NÃO definida');

// Função para inicializar o servidor
const startServer = async () => {
  try {
    console.log('\n=== Iniciando Servidor Segtrack ===');
    console.log(`Ambiente: ${process.env.NODE_ENV || 'production'}`);
    console.log(`Porta: ${port}`);
    console.log(`Host: ${host}`);
    console.log('===================================\n');

    const server = app.listen(port, host, async () => {
      console.log('\n=== Servidor Segtrack Iniciado ===');
      console.log(`Endereço: http://${host}:${port}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'production'}`);
      console.log('=================================\n');
      
      const used = process.memoryUsage();
      console.log('Status da memória:');
      console.log(`RSS: ${Math.round(used.rss / 1024 / 1024)} MB`);
      console.log(`Heap Total: ${Math.round(used.heapTotal / 1024 / 1024)} MB`);
      console.log(`Heap Usado: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
      console.log(`Externo: ${Math.round(used.external / 1024 / 1024)} MB`);
      console.log(`Buffers: ${Math.round(used.arrayBuffers / 1024 / 1024)} MB\n`);

      // Testar conexão com o banco de dados via Prisma
      try {
        await testConnection();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
      } catch (error: unknown) {
        console.error('❌ Falha ao conectar com o banco de dados:', error);
      }
    });

    // Configurar timeouts do servidor
    server.keepAliveTimeout = 620 * 1000; // 620 segundos
    server.headersTimeout = 621 * 1000; // Ligeiramente maior que keepAliveTimeout

    let isShuttingDown = false;

    // Tratamento de sinais para shutdown graceful
    const shutdown = async () => {
      if (isShuttingDown) {
        console.log('Já está em processo de desligamento...');
        return;
      }

      isShuttingDown = true;
      console.log('\nIniciando desligamento do servidor...');
      
      server.close((err) => {
        if (err) {
          console.error('Erro ao fechar o servidor:', err);
          process.exit(1);
        }
        console.log('Servidor fechado com sucesso');
        process.exit(0);
      });

      // Força o encerramento após 10 segundos
      setTimeout(() => {
        console.log('Forçando encerramento após timeout');
        process.exit(1);
      }, 10000);
    };

    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    signals.forEach(signal => {
      process.once(signal, () => {
        console.log(`Sinal ${signal} recebido`);
        shutdown();
      });
    });

    return server;

  } catch (error: unknown) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Previne que o processo seja finalizado imediatamente
process.stdin.resume();

// Iniciar o servidor
startServer().catch((error: unknown) => {
  console.error('Erro fatal ao iniciar o servidor:', error);
  process.exit(1);
}); 