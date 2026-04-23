import prisma from '../../config/db';

export class ReportService {
  async getSalesSummary(companyId: string, startDate: Date, endDate: Date) {
    const orders = await prisma.order.findMany({
      where: {
        branch: { companyId },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'COMPLETED',
      },
      select: {
        total: true,
        subtotal: true,
        tax: true,
        discount: true,
      },
    });

    const summary = orders.reduce(
      (acc, order) => {
        acc.totalSales += order.total;
        acc.totalTax += order.tax;
        acc.totalDiscount += order.discount;
        acc.orderCount += 1;
        return acc;
      },
      { totalSales: 0, totalTax: 0, totalDiscount: 0, orderCount: 0 }
    );

    return summary;
  }

  async getTopProducts(companyId: string, limit: number = 5) {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          branch: { companyId },
          status: 'COMPLETED',
        },
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    // Fetch product details for the top products
    const productDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, sku: true },
        });
        return {
          ...item,
          productName: product?.name || 'Unknown Product',
          sku: product?.sku || 'N/A',
          totalQuantity: item._sum.quantity || 0,
          totalRevenue: item._sum.total || 0,
        };
      })
    );

    return productDetails;
  }

  async getSalesTrends(companyId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await prisma.order.findMany({
      where: {
        branch: { companyId },
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const grouped = sales.reduce((acc: any, sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + sale.total;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, total]) => ({ date, total }));
  }

  async getCategoryPerformance(companyId: string) {
    const performance = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          branch: { companyId },
          status: 'COMPLETED',
        },
      },
      _sum: {
        total: true,
      },
    });

    const categoryStats: any = {};

    for (const item of performance) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { category: true },
      });

      const categoryName = product?.category?.name || 'Uncategorized';
      categoryStats[categoryName] = (categoryStats[categoryName] || 0) + (item._sum.total || 0);
    }

    return Object.entries(categoryStats).map(([name, value]) => ({ name, value }));
  }
}

export const reportService = new ReportService();
