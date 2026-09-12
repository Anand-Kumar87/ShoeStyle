# ShoeStyle - Enterprise E-Commerce Platform

A production-grade, high-performance e-commerce platform built with Next.js, TypeScript, PostgreSQL (Supabase), Prisma ORM, and Razorpay. Engineered to reliably support 2–5 lakh daily active users with sub-100ms response times.

---

## 🌟 Key Features

- **Storefront & Catalog**:
  - Lightning-fast product catalog with in-memory caching (~15ms response).
  - Dynamic filtering by category, size, price, color, and brand.
  - Authentic live sale price engine with multi-currency conversion (INR, USD, EUR, GBP, etc.).
- **Customer Experience**:
  - Mobile-first, fully responsive design with fluid checkout flow.
  - Multi-address management with instant database persistence & 1-click checkout selection.
  - Dynamic shipping rate calculation (Standard, Express, Overnight) with live admin pricing.
  - Interactive shoe reviews with sentiment moderation and verified buyer badges.
- **Cart & Checkout**:
  - Server-side authenticated pricing protection (prevents client-side price tampering).
  - Integrated Razorpay checkout with HMAC-SHA256 server-side signature verification.
  - Promotional coupon engine with real-time validation and cart discounts.
- **Security & High-Traffic Architecture**:
  - API Gateway with LRU-cached token verification against PostgreSQL.
  - Resilient rate-limiting on sensitive authentication and payment endpoints.
  - Real-time client & server telemetry error ring buffer (`/admin/observability`).
  - React Error Boundaries with automatic crash recovery.
- **Logistics & Admin**:
  - Comprehensive Admin Panel (`/admin`) for analytics, orders, products, coupons, and categories.
  - Shiprocket API integration for automatic pincode serviceability and shipment tracking.
  - Health check & readiness probe endpoint (`/api/health`).
  - Dynamic XML Sitemap (`/sitemap.xml`) & crawler rules (`/robots.txt`).

---

## 🛠️ Tech Stack

- **Framework**: Next.js (Pages Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL (Supabase) via Prisma ORM 5.21
- **Authentication**: NextAuth.js (Credentials & Google OAuth)
- **Payment Gateway**: Razorpay Payments
- **Styling**: Tailwind CSS & Lucide Icons
- **State Management**: Zustand
- **Observability**: Real-Time In-Memory Telemetry Ring Buffer & PostgreSQL Error Logging

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Anand-Kumar87/ShoeStyle.git
cd ShoeStyle
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database URL, NextAuth secret, and Razorpay keys.

### 3. Database Migration
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Deployment

For full production deployment instructions on **Vercel** or **VPS (Docker / PM2 + Nginx)**, refer to our comprehensive [Deployment Guide](DEPLOYMENT_GUIDE.md).

---

## 📄 License
This project is private and proprietary to ShoeStyle. All rights reserved.