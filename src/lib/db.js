import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const normalizePhone = (phone) => {
  if (!phone) return "";
  let p = phone.trim().replace(/\s/g, "");
  // Ensure it starts with +234 for Nigerian numbers if it's local format
  if (!p.startsWith("+")) {
    if (p.startsWith("0")) {
      p = "+234" + p.substring(1);
    } else if (p.length === 10) {
      p = "+234" + p;
    } else {
      p = "+" + p;
    }
  }
  return p;
};
