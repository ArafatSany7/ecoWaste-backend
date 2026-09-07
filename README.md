# EcoWaste - City Waste Management Field Service System API

## 📝 About The Project
EcoWaste is a comprehensive, production-ready backend API designed to orchestrate city waste management. It serves as a bridge between **Citizens** (who generate waste), **Collectors** (who pick up the waste), and **Admins** (who manage operations and analytics). 

The system automates the lifecycle of waste disposal: from a citizen raising a pickup request, to an admin assigning it to a field collector, to tracking the physical pickup, generating an invoice, and processing real-time payments through a digital payment gateway.

---

## 🛠️ Technology Stack
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Data Validation**: Zod
- **Authentication**: JSON Web Tokens (JWT) & Google OAuth 2.0
- **Payment Gateway**: bKash (Sandbox PGW)
- **Deployment**: Vercel Serverless Functions

---

## ⚙️ How It Works (Core Flows)

### 1. Citizen Flow
- Citizens register or securely log in using **Google OAuth**.
- They create a **Waste Request**, specifying the category of waste and the estimated weight.
- Once a collector picks up the waste, an **Invoice** is automatically generated based on the weight and category price.
- Citizens pay the invoice seamlessly via the integrated **bKash Payment Gateway**.

### 2. Collector Flow
- Field Collectors are registered by the Admin and assigned to specific city **Zones**.
- They receive waste pickup assignments and update the status of the request in real-time (e.g., `COLLECTOR_ARRIVED`, `COLLECTED`).

### 3. Admin Flow
- Admins oversee the entire ecosystem through an Analytics Dashboard.
- They define **Waste Categories** (e.g., Plastic, Organic) and manage **Zones**.
- They monitor pending requests and dispatch available Collectors to handle them.

---

## 📂 System Structure
This project strictly follows a **Modular / Domain-Driven Architecture**. Everything is grouped by feature rather than file type to ensure massive scalability.

```text
src/
 ├── app/
 │    ├── modules/            # Domain-driven modules
 │    │    ├── admin/         # Admin creation/management
 │    │    ├── auth/          # JWT Auth & Google Login
 │    │    ├── payment/       # bKash API & Transactions
 │    │    ├── wasteRequest/  # Core waste lifecycle
 │    │    └── ...
 │    ├── middlewares/        # Global error handlers, RBAC Auth, Zod Validation
 │    ├── config/             # Environment variables
 │    └── routes/             # Central API router
 └── server.ts                # Application entry point
```
Every module typically consists of:
- `*.route.ts` (Endpoint definitions)
- `*.controller.ts` (Request/Response handling)
- `*.service.ts` (Business logic and Prisma DB operations)
- `*.validation.ts` (Zod schemas for strict input validation)

---

## 🚀 Live Deployment
- **Live Vercel API Base URL**: `https://eco-waste-backend-nine.vercel.app`


### 🔑 Demo Admin Credentials
You can use these credentials to log in and test all Admin-protected routes:
- **Email**: `[EMAIL_ADDRESS]`
- **Password**: `[PASSWORD]`

---

## 💻 Local Setup (Initiate Procedure)

If you want to run this API locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/ArafatSany7/ecoWaste-backend.git
cd ecoWaste-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and copy the contents of `.env.example`. You will need to provide your own PostgreSQL URL, JWT Secrets, and bKash sandbox credentials.
```bash
cp .env.example .env
```

### 4. Setup the Database
Generate the Prisma client and push the schema to your PostgreSQL database:
```bash
npx prisma generate
npx prisma db push
```

### 5. Seed the Admin Account (Optional)
To create the default super admin account (`[EMAIL]`):
```bash
npm run seed
```

### 6. Start the Server
```bash
npm run dev
```
The API will now be running at `http://localhost:5000`.
