
Backend
 this is the backend folder

Frontend
 this is the complete frontend of the project 

i need aligh frontend with backend and connect them make basic backend funtionality and also create and seed local db 

---

## 🏗️ Backend Tech Stack

### Core
| Layer | Technology | Reason |
|---|---|---|
| Runtime | **Node.js 20+ LTS** | Stable, fast, great ecosystem |
| Framework | **Express.js** or **Fastify** | Fastify is faster; Express is more familiar |
| Language | **TypeScript** | Matches your frontend, type-safe |
| ORM | **Prisma** | Great DX, auto-migrations, type-safe queries |
| Database | **PostgreSQL** (local) | Relational, perfect for multi-tenant SaaS |

### Auth & Security
| Layer | Technology |
|---|---|
| Auth | **NextAuth** (already in frontend) + **JWT** for API tokens |
| Password Hashing | **bcrypt** |
| Rate Limiting | **express-rate-limit** |
| Validation | **Zod** (matches frontend patterns) |
| CORS | **cors** middleware |

### Multi-Tenancy
| Concern | Approach |
|---|---|
| Isolation | **Schema-per-tenant** or **Row-level tenancy** via `companyId` on every table |
| Recommended | **Row-level** (simpler with Prisma, easier to manage locally) |

### Supporting Libraries
| Purpose | Package |
|---|---|
| Logging | **Winston** or **Pino** |
| Env config | **dotenv** + **envalid** |
| File uploads | **Multer** + local storage (S3-ready later) |
| PDF/Receipt | **jsPDF** (already used in frontend) |
| Job queues | **Bull** (for recurring expenses, reports) |
| API docs | **Swagger / OpenAPI** via `swagger-ui-express` |

---

## 📂 Suggested Folder Structure

```
/backend
├── src/
│   ├── config/           # DB, env, cors config
│   ├── middlewares/       # Auth, tenant resolver, error handler
│   ├── modules/
│   │   ├── auth/         # Login, register, password reset
│   │   ├── company/      # Multi-tenant company management
│   │   ├── branch/       # Branch CRUD
│   │   ├── staff/        # Staff & roles
│   │   ├── inventory/    # Products, categories, stock
│   │   ├── pos/          # Orders, checkout, payments
│   │   ├── customers/    # Loyalty, history
│   │   ├── expenses/     # Financial tracking
│   │   └── reports/      # Sales, profit calculations
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── utils/            # Helpers, receipt gen, stat calc
│   └── app.ts            # Express/Fastify entry
├── .env
├── package.json
└── tsconfig.json
```

---

## 🗄️ Core Prisma Schema Design (Multi-Tenant)

```prisma
// Key models reflecting your frontend modules

model Company {
  id         String   @id @default(cuid())
  name       String
  plan       Plan     @default(FREE)
  branches   Branch[]
  staff      Staff[]
  products   Product[]
  customers  Customer[]
  createdAt  DateTime @default(now())
}

model Branch {
  id        String  @id @default(cuid())
  name      String
  companyId String
  company   Company @relation(fields: [companyId], references: [id])
  orders    Order[]
}

model Staff {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  role      Role     @default(CASHIER)
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  passwordHash String
}

model Product {
  id         String   @id @default(cuid())
  name       String
  price      Float
  stock      Int
  companyId  String
  company    Company  @relation(fields: [companyId], references: [id])
  orderItems OrderItem[]
}

model Order {
  id         String      @id @default(cuid())
  branchId   String
  branch     Branch      @relation(fields: [branchId], references: [id])
  customerId String?
  items      OrderItem[]
  total      Float
  paymentType PaymentType
  createdAt  DateTime    @default(now())
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  unitPrice Float
}

model Customer {
  id        String  @id @default(cuid())
  name      String
  phone     String?
  points    Int     @default(0)
  companyId String
  company   Company @relation(fields: [companyId], references: [id])
}

enum Role { OWNER MANAGER CASHIER }
enum Plan { FREE BASIC PRO ENTERPRISE }
enum PaymentType { CASH CARD }
```

---

## 🔌 API Route Map (matching your frontend)

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/forgot-password

GET    /api/v1/companies              # owner: list companies
POST   /api/v1/companies              # onboarding

GET    /api/v1/branches
POST   /api/v1/branches

GET    /api/v1/inventory/products
POST   /api/v1/inventory/products
PUT    /api/v1/inventory/products/:id
DELETE /api/v1/inventory/products/:id

GET    /api/v1/staff
POST   /api/v1/staff

POST   /api/v1/pos/orders             # checkout
GET    /api/v1/pos/orders/:id         # receipt

GET    /api/v1/customers
POST   /api/v1/customers

GET    /api/v1/reports/sales
GET    /api/v1/reports/expenses
```

---

## 🚀 Getting Started Commands

```bash
# Init project
mkdir backend && cd backend
npm init -y
npm install express typescript ts-node prisma @prisma/client zod bcrypt jsonwebtoken cors dotenv
npm install -D @types/express @types/node @types/bcrypt @types/jsonwebtoken tsx nodemon

# Init Prisma with PostgreSQL
npx prisma init --datasource-provider postgresql

# After writing schema
npx prisma migrate dev --name init
npx prisma generate
```

`.env` for local:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lankateach_pos"
JWT_SECRET="your-secret-key"
PORT=5000
```

---

## 🧩 Integration with Your Frontend

Your frontend already has `NEXT_PUBLIC_API_URL=http://localhost:5000` — so the backend just needs to serve on port `5000` and your proxy routes (`/api/v1/contact`, `/api/v1/auth/forgot-password`) will wire up immediately.

---
