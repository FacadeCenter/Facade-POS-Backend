import prisma from '../../config/db';

export class PlatformService {
  async getGlobalStats() {
    const totalTenants = await prisma.company.count();
    const activeTenants = await prisma.company.count({ where: { isActive: true } });
    const totalUsers = await prisma.staff.count();
    
    const revenueResult = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'COMPLETED' }
    });
    const globalRevenue = revenueResult._sum.total || 0;

    // Get revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        status: 'COMPLETED',
        createdAt: { gte: sixMonthsAgo }
      },
      _sum: { total: true }
    });

    // Plan distribution
    const planCounts = await prisma.company.groupBy({
      by: ['plan'],
      _count: { id: true }
    });

    // Support summary
    const ticketSummary = await prisma.supportTicket.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    return {
      totalTenants,
      activeTenants,
      totalUsers,
      globalRevenue,
      revenueTrend: monthlyRevenue, // Frontend will aggregate by month
      planDistribution: planCounts.map(p => ({ name: p.plan, value: p._count.id })),
      ticketSummary: ticketSummary.map(t => ({ status: t.status, count: t._count.id }))
    };
  }

  async getAllTenants() {
    return prisma.company.findMany({
      include: {
        _count: {
          select: { branches: true, staff: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllUsers() {
    return prisma.staff.findMany({
      include: {
        company: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAuditLogs() {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  async getBilling() {
    const subscriptions = await prisma.subscription.findMany({
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const invoices = await prisma.invoice.findMany({
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return { subscriptions, invoices };
  }

  async getBranches() {
    return prisma.branch.findMany({
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDevices() {
    return prisma.device.findMany({
      include: { 
        company: { select: { name: true } },
        branch: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOrders() {
    return prisma.order.findMany({
      include: { 
        branch: { include: { company: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take: 200
    });
  }

  async getSupportTickets() {
    return prisma.supportTicket.findMany({
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const platformService = new PlatformService();
