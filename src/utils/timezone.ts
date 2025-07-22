/**
 * Utilitários para conversão de fuso horário
 */

/**
 * Converte uma data UTC para fuso horário brasileiro
 */
export function toBrazilianTime(date: Date | string): Date {
  const utcDate = new Date(date);
  const brazilianTime = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return brazilianTime;
}

/**
 * Converte uma data do fuso brasileiro para UTC
 */
export function toUTC(date: Date): Date {
  const brazilianTime = new Date(date);
  const utcTime = new Date(brazilianTime.toLocaleString('en-US', { timeZone: 'UTC' }));
  return utcTime;
}

/**
 * Formata uma data para exibição no fuso brasileiro
 */
export function formatBrazilianTime(date: Date | string): string {
  const brazilianDate = toBrazilianTime(date);
  return brazilianDate.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Obtém a data atual no fuso brasileiro
 */
export function getCurrentBrazilianTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
}

/**
 * Converte timestamp para string no fuso brasileiro
 */
export function timestampToBrazilianString(timestamp: Date | string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
} 