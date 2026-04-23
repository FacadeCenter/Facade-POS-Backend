import prisma from '../../config/db';

export class AnalyticsService {
  async getDashboardStats(companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalSales, totalCustomers, lowStockProducts, totalExpenses] = await Promise.all([
      // Total Sales
      prisma.order.aggregate({
        where: { branch: { companyId }, status: 'COMPLETED' },
        _sum: { total: true }
      }),
      // Total Customers
      prisma.customer.count({
        where: { companyId }
      }),
      // Low Stock Products
      prisma.product.count({
        where: { companyId, stock: { lte: 5 } } // Fixed: comparing to static 5 for now
      }),
      // Total Expenses
      prisma.expense.aggregate({
        where: { companyId },
        _sum: { amount: true }
      })
    ]);

    return [
      {
        title: "Total Sales",
        amount: totalSales._sum.total || 0,
        percentage: "+12.5%",
        trend: "up",
        caption: "Since last month"
      },
      {
        title: "Customers",
        value: totalCustomers.toString(),
        percentage: "+3.2%",
        trend: "up",
        caption: "Since last month"
      },
      {
        title: "Low Stock Products",
        value: lowStockProducts.toString(),
        percentage: "-2.4%",
        trend: "down",
        caption: "Items need attention"
      },
      {
        title: "Expenses",
        amount: totalExpenses._sum.amount || 0,
        percentage: "+5.1%",
        trend: "up",
        caption: "Since last month"
      }
    ];
  }

  async getSalesTrends(companyId: string) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

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
      const date = sale.createdAt.toLocaleDateString('en-US', { weekday: 'short' });
      acc[date] = (acc[date] || 0) + sale.total;
      return acc;
    }, {});

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const orderedDays = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        orderedDays.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    return orderedDays.map(day => ({
      name: day,
      sales: grouped[day] || 0
    }));
  }

  async getSalesBar(companyId: string) {
    // Hourly sales for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const sales = await prisma.order.findMany({
      where: {
        branch: { companyId },
        status: 'COMPLETED',
        createdAt: { gte: startOfDay },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      value: 0,
    }));

    sales.forEach(sale => {
      const hour = sale.createdAt.getHours();
      hourlyData[hour].value += sale.total;
    });

    return hourlyData;
  }

  async getTopSelling(companyId: string) {
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
      take: 5,
    });

    return Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true, imageUrl: true }
        });
        return {
          id: item.productId,
          name: product?.name || 'Unknown',
          price: product?.price || 0,
          sales: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
          image: product?.imageUrl || 'https://via.placeholder.com/150?text=Product'
        };
      })
    );
  }
  
  async getStaffPerformance(companyId: string) {
      const staff = await prisma.staff.findMany({
          where: { companyId },
          select: {
              id: true,
              name: true,
              role: true,
              _count: {
                  select: { orders: { where: { status: 'COMPLETED' } } }
              },
              orders: {
                  where: { status: 'COMPLETED' },
                  select: { total: true }
              }
          }
      });
      
      return staff.map(s => ({
          id: s.id,
          name: s.name,
          role: s.role,
          orders: s._count.orders,
          revenue: s.orders.reduce((sum, o) => sum + o.total, 0),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`
      })).sort((a, b) => b.revenue - a.revenue);
  }
}

export const analyticsService = new AnalyticsService();
