import { Prisma } from '@prisma/client';

export const jsonUtils = {
  parse: (value: Prisma.JsonValue): unknown => {
    if (value === null) return null;
    if (typeof value === 'string') return JSON.parse(value);
    return value;
  },

  stringify: (value: unknown): Prisma.JsonValue => {
    if (value === null) return null;
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  }
}; 