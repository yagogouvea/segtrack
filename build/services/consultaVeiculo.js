"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarVeiculoPorPlaca = buscarVeiculoPorPlaca;
// ✅ src/services/veiculos.ts
const axios_1 = __importDefault(require("axios"));
const API_URL = 'https://gateway.apibrasil.io/api/v2/vehicles/dados';
async function buscarVeiculoPorPlaca(placa) {
    try {
        const response = await axios_1.default.post(API_URL, { placa: placa.toUpperCase() }, {
            headers: {
                'Content-Type': 'application/json',
                'DeviceToken': process.env.API_BRASIL_DEVICE || '',
                'Authorization': `Bearer ${process.env.API_BRASIL_BEARER}`
            },
        });
        return response.data;
    }
    catch (error) {
        console.error('❌ Erro ao consultar API Brasil:', error);
        return null;
    }
}
