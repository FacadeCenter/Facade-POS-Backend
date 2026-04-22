import { Staff } from '@prisma/client';
import { BaseRepository } from '../../prisma/base.repository';
import prisma from '../../config/db';

export class StaffRepository extends BaseRepository<Staff> {
  constructor() {
    super('staff');
  }

  async findByEmail(email: string): Promise<Staff | null> {
    return this.model.findUnique({
      where: { email },
      include: {
        company: true,
        branch: true,
      },
    });
  }

  async findWithDetails(id: string): Promise<Staff | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        company: true,
        branch: true,
      },
    });
  }
}

export const staffRepository = new StaffRepository();
