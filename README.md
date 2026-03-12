# TORÉA Fashion Storefront

An ecommerce storefront built with Next.js, tailored for a Nigeria-first fashion brand. TORÉA combines modern React features with Clerk authentication, Prisma ORM, and Paystack payments to deliver a performant and secure shopping experience.

## 📁 Project Overview

- **Framework**: Next.js App Router (v16) with TypeScript
- **UI**: Tailwind CSS utility classes
- **Authentication**: Clerk (Next.js integration)
- **Database**: Prisma with PostgreSQL
- **Payments**: Paystack API
- **Image Storage**: Cloudflare R2 / Images
- **Hosting**: Vercel (optimal for Next.js)

### Key Features

- Homepage with video hero, category grid, featured products, user reviews, and newsletter signup
- Transactional email support via Resend (order confirmations, newsletter welcomes)
- Account area with orders and profile (Clerk-powered)
- Admin interface for managing products, orders, collections, discounts
- Product detail pages with variant selection and recommendations
- Cart, checkout, and webhook handling for Paystack
- Newsletter subscription endpoint & Google Sheets sync script
- Full TypeScript type-safety with ESLint and Turbopack build optimizations

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repo-url> torea
   cd torea
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or pnpm/yarn
   ```

3. **Configure environment variables**
   Create a `.env.local` file at project root with the following values:
   ```env
   DATABASE_URL=postgresql://user:pass@host:port/db
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   CLOUDFLARE_IMAGES_ACCOUNT_HASH=...
   PAYSTACK_SECRET_KEY=...
   PAYSTACK_PUBLIC_KEY=...
   CLERK_SECRET_KEY=...
   CLERK_PUBLISHABLE_KEY=...
   ADMIN_EMAIL=admin@example.com
   # Optional: transactional email service (Resend.com)
   RESEND_API_KEY=...
   ```

   > See `.env.example` for reference if available.

4. **Run migrations and seed data**
   ```bash
   npx prisma migrate deploy
   node prisma/seed.mjs
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with live reload |
| `npm run build` | Create production build (Turbopack) |
| `npm run start` | Run production server locally |
| `npm run lint` | Run ESLint with TypeScript rules |
| `npm run format` | (if configured) Format code with Prettier |

## 🛠 Code Structure

- `app/` – Next.js app router pages and layout
- `components/` – Reusable React components (home, header, product, etc.)
- `server/` – API logic, actions, database helpers, auth
- `prisma/` – Prisma schema, migrations, seed script
- `scripts/` – Utility scripts (e.g. product import)
- `data/` – Example CSV templates

## 🔐 Authentication & Admin

- Clerk handles sign-up/sign-in and provides user context.
- Custom RBAC layer (`server/auth/rbac.ts`) checks roles and admin email.
- Admin pages live under `app/(admin)` and require logged-in admin.

## 💳 Payments & Checkout

- Cart and checkout endpoints implemented in `app/api/cart` and `app/api/checkout`.
- Paystack webhook routes validate transactions and fulfill orders.

## 📬 Newsletter

- `/api/newsletter` endpoint accepts subscriptions.
- Background job syncs subscribers with Google Sheets using server script.

## 🛠 Deployment

1. Push repo to GitHub.
2. Import project into Vercel and set environment variables.
3. Vercel handles build (`npm run build`) and deploys the app.
4. Webhooks (Clerk, Paystack) require publicly accessible URLs – Vercel provides them.

## ✅ Linting & Quality

- ESLint with TypeScript rules (`npm run lint`) ensures consistency.
- Type safety across the codebase; build fails on type errors.

## 📄 Documentation & Policies

- Refund policy page: `/refund-policy`
- Terms, privacy, and other static pages can be added under `app/`.

## 🤝 Contributing

Feel free to submit issues or pull requests. Comments and suggestions are welcome!

---

Built and maintained by the TORÉA team.  
Vercel & Next.js power the frontend, Prisma on the backend, and a focus on Nigerian user experience drives all decisions.
