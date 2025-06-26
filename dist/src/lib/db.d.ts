import { prisma } from './prisma';
export { prisma };
export declare function testConnection(): Promise<boolean>;
export declare function analyzeMySQLError(error: any): any;
export declare function disconnectPrisma(): Promise<void>;
//# sourceMappingURL=db.d.ts.map