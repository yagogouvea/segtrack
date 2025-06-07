import { ensurePrisma, testConnection as testPrismaConnection, disconnectPrisma as disconnectPrismaClient } from '../../lib/prisma';

export { testPrismaConnection as testConnection, disconnectPrismaClient as disconnectPrisma };

export default ensurePrisma(); 