import { PrismaClient } from '@prisma/client';
declare let prisma: PrismaClient;
declare global {
    var __prisma: PrismaClient | undefined;
}
export declare const initializeDatabase: () => Promise<void>;
export declare const closeDatabase: () => Promise<void>;
export default prisma;
//# sourceMappingURL=database.d.ts.map