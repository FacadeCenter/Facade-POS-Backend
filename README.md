# SaaS Prime POS Backend

This is the backend API for the SaaS Prime POS micro-SaaS platform, built with Express.js, TypeScript, and Prisma.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database running locally

### 2. Environment Setup
Create a `.env` file in the `Backend` root directory:

```env
DATABASE_URL="postgresql://asithalakmal@localhost:5432/saasprime_pos"
JWT_SECRET="saasprime-super-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Installation & Database Setup
```bash
npm install
npx prisma migrate dev --name init
npm run seed
```

### 4. Running the Server
```bash
npm run dev
```
The server will be available at `http://localhost:5000`.

---

## 🌱 Seeding & Credentials

The seed script (`npm run seed`) populates the database with a demo company, a branch, and test users.

### 🔑 Default Login Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **OWNER** | `admin@demo.com` | `password123` | Full admin dashboard & company settings |
| **CASHIER** | `cashier@demo.com` | `password123` | Direct access to POS Dashboard |

---

## 🛠️ Tech Stack
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Auth**: JWT (JSON Web Tokens)
- **Validation**: Zod

## 📡 API Endpoints
- `/api/v1/auth`: Authentication & Session Management
- `/api/v1/branches`: Branch Management
- `/api/v1/inventory`: Product & Stock Management
- `/api/v1/pos`: Orders & Sales processing
- `/api/v1/customers`: Customer data
- `/api/v1/expenses`: Expense tracking
- `/api/v1/reports`: Business intelligence reports
- `/api/health`: System health check
