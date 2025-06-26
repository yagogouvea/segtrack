import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: true,
      ignore: 'pid,hostname',
      messageFormat: '{msg}',
      colorize: true
    }
  }
});

export default logger; 