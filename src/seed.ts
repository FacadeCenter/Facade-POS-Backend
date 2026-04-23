import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Cleaning database...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.company.deleteMany();

  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Company
  const company = await prisma.company.create({
    data: {
      name: 'Facade Center Demo',
      email: 'admin@facade.com',
      plan: 'PRO',
      phone: '0112345678',
      address: 'Colombo, Sri Lanka',
    },
  });

  // 2. Branches
  const mainBranch = await prisma.branch.create({
    data: { name: 'Colombo Main', companyId: company.id },
  });
  const subBranch = await prisma.branch.create({
    data: { name: 'Kandy Branch', companyId: company.id },
  });

  // 3. Staff
  await prisma.staff.create({
    data: { name: 'Super Admin', email: 'super@saasprime.com', role: 'PLATFORM_ADMIN', passwordHash },
  });
  const admin = await prisma.staff.create({
    data: { name: 'Admin User', email: 'admin@demo.com', role: 'TENANT_ADMIN', companyId: company.id, passwordHash },
  });
  const cashier = await prisma.staff.create({
    data: { name: 'Main Cashier', email: 'cashier@demo.com', role: 'TENANT_CASHIER', companyId: company.id, branchId: mainBranch.id, passwordHash },
  });

  // 4. Categories
  const cat1 = await prisma.category.create({ data: { name: 'Electronics', companyId: company.id } });
  const cat2 = await prisma.category.create({ data: { name: 'Hardware', companyId: company.id } });
  const cat3 = await prisma.category.create({ data: { name: 'Services', companyId: company.id } });

  // 5. Products
  const products = [];
  const prodNames = ['Router', 'Switch', 'Cable', 'Screwdriver', 'Hammer', 'Drill', 'Service Fee', 'Maintenance'];
  for (let i = 0; i < prodNames.length; i++) {
    const p = await prisma.product.create({
      data: {
        name: prodNames[i],
        price: Math.floor(Math.random() * 100) + 10,
        cost: Math.floor(Math.random() * 50) + 5,
        stock: Math.floor(Math.random() * 200) + 10,
        minStock: 15,
        companyId: company.id,
        categoryId: i < 3 ? cat1.id : i < 6 ? cat2.id : cat3.id,
      }
    });
    products.push(p);
  }

  // 6. Customers
  const customers = [];
  const names = ['Amal Perera', 'Sunil Silva', 'Nimal Fernando', 'Kamal Siriwardena'];
  for (const name of names) {
    const c = await prisma.customer.create({
      data: { name, phone: '077123456' + Math.floor(Math.random() * 10), companyId: company.id }
    });
    customers.push(c);
  }

  // 7. Orders (Last 30 days)
  console.log('📦 Creating historical orders...');
  for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 5) + 1;
    const total = randomProduct.price * qty;

    await prisma.order.create({
      data: {
        orderNumber: `ORD-${2000 + i}`,
        branchId: i % 2 === 0 ? mainBranch.id : subBranch.id,
        staffId: cashier.id,
        customerId: customers[Math.floor(Math.random() * customers.length)].id,
        status: 'COMPLETED',
        subtotal: total,
        total: total,
        paymentType: i % 3 === 0 ? 'CARD' : 'CASH',
        createdAt: date,
        items: {
          create: [{
            productId: randomProduct.id,
            quantity: qty,
            unitPrice: randomProduct.price,
            total: total
          }]
        }
      }
    });
  }

  // 8. Expenses
  const expCats: any[] = ['RENT', 'UTILITIES', 'SALARIES', 'SUPPLIES', 'OTHER'];
  for (let i = 0; i < 10; i++) {
    await prisma.expense.create({
      data: {
        title: `Monthly ${expCats[i % 5]}`,
        amount: Math.floor(Math.random() * 1000) + 100,
        category: expCats[i % 5],
        companyId: company.id,
        date: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
      }
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
