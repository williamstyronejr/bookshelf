import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-unused-vars
  var prisma: PrismaClient | undefined;
}

// @ts-ignore: Unreachable code error
// eslint-disable-next-line
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
