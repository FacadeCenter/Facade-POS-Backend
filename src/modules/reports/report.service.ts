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
          productName: product?.name,
          sku: product?.sku,
          totalQuantity: item._sum.quantity,
          totalRevenue: item._sum.total,
        };
      })
    );

    return productDetails;
  }
}

export const reportService = new ReportService();
