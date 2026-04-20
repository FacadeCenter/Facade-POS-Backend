import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Cleaning database...');
  
  // Order of deletion matters due to relations
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.company.deleteMany();

  console.log('🌱 Seeding database...');

  // Create a company
  const company = await prisma.company.create({
    data: {
      name: 'SmartStore Demo',
      email: 'demo@smartstore.com',
      plan: 'FREE',
    },
  });

  // Create a branch
  const branch = await prisma.branch.create({
    data: {
      name: 'Main Branch',
      companyId: company.id,
    },
  });

  // Create an owner staff
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.staff.create({
    data: {
      name: 'Admin User',
      email: 'admin@demo.com',
      role: 'OWNER',
      companyId: company.id,
      passwordHash,
    },
  });

  // Create a cashier staff
  await prisma.staff.create({
    data: {
      name: 'Cashier User',
      email: 'cashier@demo.com',
      role: 'CASHIER',
      companyId: company.id,
      branchId: branch.id,
      passwordHash,
    },
  });

  // Create some products
  await prisma.product.createMany({
    data: [
      { name: 'Apple', price: 0.5, stock: 100, companyId: company.id },
      { name: 'Banana', price: 0.3, stock: 150, companyId: company.id },
      { name: 'Milk', price: 1.2, stock: 50, companyId: company.id },
      { name: 'Bread', price: 1.0, stock: 30, companyId: company.id },
    ],
  });

  // Create some customers
  await prisma.customer.createMany({
    data: [
      { name: 'John Doe', phone: '1234567890', companyId: company.id },
      { name: 'Jane Smith', phone: '0987654321', companyId: company.id },
    ],
  });

  console.log('✅ Seeding completed!');
  console.log('🔑 Credentials: admin@demo.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
