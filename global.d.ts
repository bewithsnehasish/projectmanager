import { PrismaClient } from "@prisma/client";

declare global {
  const prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  global.prisma = new PrismaClient();
}

//globalThis.prism: This global variable ensures that the PrismaClient instance is reused across hot reloads during development. Without this file, each time your application reload, a new instance of PrismaClient is created, which means that you lose the connection to the Prisma database.
