import { PrismaClient } from '@prisma/client';
import prisma from '../config/db';

export abstract class BaseRepository<T> {
  protected model: any;

  constructor(modelName: string) {
    this.model = (prisma as any)[modelName];
  }

  async findAll(filter: object = {}): Promise<T[]> {
    return this.model.findMany({ where: filter });
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findOne(filter: object): Promise<T | null> {
    return this.model.findFirst({ where: filter });
  }

  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  async count(filter: object = {}): Promise<number> {
    return this.model.count({ where: filter });
  }
}
