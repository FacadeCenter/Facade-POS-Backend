import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Cleaning database...');
  await prisma.auditLog.deleteMany();
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
      email: 'admin@demo.com',
      plan: 'ENTERPRISE',
      phone: '0112345678',
      address: 'Colombo, Sri Lanka',
    },
  });

  // 2. Branches
  const mainBranch = await prisma.branch.create({
    data: { name: 'Colombo Main', address: '123 Main St, Colombo', phone: '0111111111', companyId: company.id },
  });
  const kandyBranch = await prisma.branch.create({
    data: { name: 'Kandy Branch', address: '456 Hill St, Kandy', phone: '0812222222', companyId: company.id },
  });
  const galleBranch = await prisma.branch.create({
    data: { name: 'Galle Branch', address: '789 Fort Rd, Galle', phone: '0913333333', companyId: company.id },
  });
  const branches = [mainBranch, kandyBranch, galleBranch];

  // 3. Staff (Required Roles + Extra)
  await prisma.staff.create({
    data: { name: 'Super Admin', email: 'super@saasprime.com', role: 'PLATFORM_ADMIN', passwordHash },
  });
  const admin = await prisma.staff.create({
    data: { name: 'Admin User', email: 'admin@demo.com', role: 'TENANT_ADMIN', companyId: company.id, passwordHash },
  });
  const manager = await prisma.staff.create({
    data: { name: 'Branch Manager', email: 'manager@demo.com', role: 'TENANT_MANAGER', companyId: company.id, branchId: mainBranch.id, passwordHash },
  });
  const cashier = await prisma.staff.create({
    data: { name: 'Main Cashier', email: 'cashier@demo.com', role: 'TENANT_CASHIER', companyId: company.id, branchId: mainBranch.id, passwordHash },
  });
  
  // Extra staff to reach 10 rows
  for(let i=1; i<=7; i++) {
     await prisma.staff.create({
        data: { name: `Cashier ${i}`, email: `cashier${i}@demo.com`, role: 'TENANT_CASHIER', companyId: company.id, branchId: branches[i%3].id, passwordHash },
     });
  }

  // 4. Categories (15 categories)
  const categoryNames = [
    'Electronics', 'Hardware', 'Services', 'Networking', 'Cables', 
    'Tools', 'Software', 'Accessories', 'Power', 'Storage',
    'Security', 'Audio', 'Video', 'Office', 'Furniture'
  ];
  const categories = [];
  for (const name of categoryNames) {
    const cat = await prisma.category.create({ data: { name, companyId: company.id } });
    categories.push(cat);
  }

  // 5. Products (30 products)
  const products = [];
  for (let i = 1; i <= 30; i++) {
    const p = await prisma.product.create({
      data: {
        name: `Product ${i} Pro`,
        sku: `PRD-${1000 + i}`,
        price: Math.floor(Math.random() * 500) + 50,
        cost: Math.floor(Math.random() * 250) + 20,
        companyId: company.id,
        categoryId: categories[i % categories.length].id,
      }
    });

    // Create inventory for EACH branch (High-Scale Multi-Tenant approach)
    for (const branch of branches) {
      await prisma.inventory.create({
        data: {
          productId: p.id,
          branchId: branch.id,
          quantity: Math.floor(Math.random() * 500) + 20,
          minStock: 15,
        }
      });
    }

    products.push(p);
  }

  // 6. Customers (20 customers)
  const customers = [];
  for (let i = 1; i <= 20; i++) {
    const c = await prisma.customer.create({
      data: { 
        name: `Customer ${i} Fernando`, 
        email: `customer${i}@example.com`,
        phone: '07712345' + (i < 10 ? '0'+i : i), 
        companyId: company.id 
      }
    });
    customers.push(c);
  }

  // 7. Suppliers (15 suppliers)
  const suppliers = [];
  for(let i = 1; i <= 15; i++) {
    const s = await prisma.supplier.create({
      data: {
        name: `Supplier Agent ${i}`,
        companyName: `Global Supply Co ${i}`,
        email: `supply${i}@global.com`,
        phone: '01144455' + (i < 10 ? '0'+i : i),
        type: i % 2 === 0 ? 'COMPANY' : 'INDIVIDUAL',
        companyId: company.id
      }
    });
    suppliers.push(s);
  }

  // 8. Expenses (25 expenses)
  const expCats: any[] = ['RENT', 'UTILITIES', 'SALARIES', 'SUPPLIES', 'MARKETING', 'MAINTENANCE', 'OTHER'];
  for (let i = 1; i <= 25; i++) {
    await prisma.expense.create({
      data: {
        title: `Expense Record ${i}`,
        amount: Math.floor(Math.random() * 5000) + 100,
        category: expCats[i % expCats.length],
        companyId: company.id,
        date: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)) // Last 60 days
      }
    });
  }

  // 9. Orders (50 Orders)
  console.log('📦 Creating historical orders...');
  for (let i = 1; i <= 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Spread over 60 days
    
    // Pick 1-3 random products
    const numItems = Math.floor(Math.random() * 3) + 1;
    const orderItemsData = [];
    let orderTotal = 0;

    for(let j=0; j<numItems; j++) {
       const randomProduct = products[Math.floor(Math.random() * products.length)];
       const qty = Math.floor(Math.random() * 5) + 1;
       const lineTotal = randomProduct.price * qty;
       orderTotal += lineTotal;
       
       orderItemsData.push({
         productId: randomProduct.id,
         quantity: qty,
         unitPrice: randomProduct.price,
         total: lineTotal
       });
    }

    await prisma.order.create({
      data: {
        orderNumber: `ORD-${20000 + i}`,
        branchId: branches[i % branches.length].id,
        staffId: cashier.id,
        customerId: customers[Math.floor(Math.random() * customers.length)].id,
        status: i % 10 === 0 ? 'CANCELLED' : 'COMPLETED',
        subtotal: orderTotal,
        total: orderTotal,
        paymentType: i % 3 === 0 ? 'CARD' : 'CASH',
        createdAt: date,
        items: {
          create: orderItemsData
        }
      }
    });
  }

  console.log('✅ Seeding completed with comprehensive relational data!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
