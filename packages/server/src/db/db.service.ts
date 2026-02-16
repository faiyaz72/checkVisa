import "dotenv/config";
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private _prisma: PrismaClient;

  constructor() {
    const connectionString = `${process.env.DATABASE_URL}`;
    const adapter = new PrismaPg({ connectionString });
    this._prisma = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this._prisma.$connect();
  }

  async onModuleDestroy() {
    await this._prisma.$disconnect();
  }

  /**
   * Prisma client for direct access to all models and queries.
   * Use for create, findUnique, findMany, update, delete, etc.
   */
  get client(): PrismaClient {
    return this._prisma;
  }
}
