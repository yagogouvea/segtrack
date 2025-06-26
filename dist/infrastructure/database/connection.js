"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectPrisma = exports.testConnection = void 0;
const prisma_1 = require("../../lib/prisma");
Object.defineProperty(exports, "testConnection", { enumerable: true, get: function () { return prisma_1.testConnection; } });
Object.defineProperty(exports, "disconnectPrisma", { enumerable: true, get: function () { return prisma_1.disconnectPrisma; } });
exports.default = (0, prisma_1.ensurePrisma)();
