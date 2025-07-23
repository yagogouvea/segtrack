"use strict";
/**
 * Utilitários para conversão de fuso horário
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBrazilianTime = toBrazilianTime;
exports.toUTC = toUTC;
exports.formatBrazilianTime = formatBrazilianTime;
exports.getCurrentBrazilianTime = getCurrentBrazilianTime;
exports.timestampToBrazilianString = timestampToBrazilianString;
/**
 * Converte uma data UTC para fuso horário brasileiro
 */
function toBrazilianTime(date) {
    const utcDate = new Date(date);
    const brazilianTime = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    return brazilianTime;
}
/**
 * Converte uma data do fuso brasileiro para UTC
 */
function toUTC(date) {
    const brazilianTime = new Date(date);
    const utcTime = new Date(brazilianTime.toLocaleString('en-US', { timeZone: 'UTC' }));
    return utcTime;
}
/**
 * Formata uma data para exibição no fuso brasileiro
 */
function formatBrazilianTime(date) {
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
function getCurrentBrazilianTime() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
}
/**
 * Converte timestamp para string no fuso brasileiro
 */
function timestampToBrazilianString(timestamp) {
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
