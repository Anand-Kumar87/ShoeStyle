# ShoeStyle Enterprise Production Deployment Guide

This guide provides step-by-step instructions for launching **ShoeStyle** to production, optimized for high traffic (2–5 lakh daily active users), low latency, and 99.99% uptime.

---

## 🏗️ Architecture Overview

- **Frontend & API**: Next.js 14/16 (Pages Router) with Server-Side Rendering (SSR) & Incremental Static Regeneration (ISR).
- **Database**: PostgreSQL on Supabase with Supavisor / PgBouncer connection pooling.
- **ORM**: Prisma Client v5.21 with prepared statements and optimized connection limits.
- **Cache & Performance**:
  - In-memory Product Catalog Cache (60s TTL, ~15ms response time).
  - High-traffic Token Verification LRU cache (60s TTL) at API Gateway.
  - Telemetry error ring buffer + async PostgreSQL persistence.
- **Payments**: Razorpay Gateway (HMAC SHA-256 signature verification).
- **Logistics**: Shiprocket API integration for live pincode tracking and dispatch.
- **Authentication**: NextAuth.js JWT-based session management with PostgreSQL session validation.

---

## 📋 1. Prerequisites Checklist

Before launching, ensure you have:
1. **GitHub Repository**: Latest clean code pushed to `main`.
2. **PostgreSQL Database**: Supabase instance running PostgreSQL 15+.
3. **Razorpay Live Account**: Live Key ID (`rzp_live_...`) and Key Secret.
4. **Custom Domain**: DNS control for your domain (e.g., `shoestyle.in`).
5. **Transactional Email**: Gmail App Password or Resend / SendGrid / SMTP credentials.

---

## 🗄️ 2. Database & Connection Pooling (High Traffic Configuration)

When handling 2–5 lakh users daily, standard direct database connections (port 5432) will exhaust database connection limits. 

### Step 2.1: Use Supavisor Connection Pooling
In your hosting platform environment variables:
- Set `DATABASE_URL` to Supabase's **Session or Transaction Pooler** (port `6543`) with `?pgbouncer=true&connection_limit=20`.
- Set `DIRECT_URL` to Supabase's **Direct connection** (port `5432`) for running schema migrations.

### Step 2.2: Apply Database Schema
Run migrations from your terminal:
```bash
npx prisma db push
```

---

## 🚀 3. Deploying to Vercel (Recommended)

Vercel provides edge caching, automatic SSL, serverless scalability, and instant rollbacks.

### Step 3.1: Import Project
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **"Add New Project"** and select `Anand-Kumar87/ShoeStyle`.
3. Select **Framework Preset**: `Next.js`.
4. Root Directory: `./`.

### Step 3.2: Configure Environment Variables
Add the following variables in Vercel Project Settings > **Environment Variables**:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Pooled DB URL (Port 6543) | `postgresql://...:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct DB URL (Port 5432) | `postgresql://...:5432/postgres` |
| `NEXTAUTH_URL` | Production Domain URL | `https://shoestyle.in` |
| `NEXTAUTH_SECRET` | 32+ character random key | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Public Domain | `https://shoestyle.in` |
| `RAZORPAY_KEY_ID` | Razorpay Live Key | `rzp_live_xxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay Live Secret | `xxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Live Key (Client) | `rzp_live_xxxxxxxx` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | `https://[id].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase Anon Public Key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Admin Secret Key | `eyJ...` |
| `EMAIL_USER` | Production Email Address | `noreply@shoestyle.in` |
| `EMAIL_PASS` | Email App Password | `xxxx xxxx xxxx xxxx` |
| `NODE_ENV` | Environment Flag | `production` |

### Step 3.3: Deploy
Click **Deploy**. Vercel will build and deploy the application in under 2 minutes.

### Step 3.4: Configure Custom Domain
1. In Vercel, go to **Settings > Domains**.
2. Add your custom domain: `shoestyle.in` and `www.shoestyle.in`.
3. Add the provided `CNAME` and `A` records in your domain registrar (GoDaddy, Namecheap, Cloudflare).
4. SSL certificate will automatically be provisioned via Let's Encrypt.

---

## 🖥️ 4. Alternative: Deploying to VPS / Ubuntu (PM2 + Nginx)

If hosting on AWS EC2, DigitalOcean, or Linode:

### Step 4.1: Clone and Build
```bash
git clone https://github.com/Anand-Kumar87/ShoeStyle.git
cd ShoeStyle
npm install --production=false
cp .env.example .env.production
# Edit .env.production with your real secrets
nano .env.production
npm run build
```

### Step 4.2: Run with PM2 Process Manager
```bash
npm install -g pm2
pm2 start npm --name "shoestyle" -- start
pm2 save
pm2 startup
```

### Step 4.3: Configure Nginx Reverse Proxy & SSL
```nginx
server {
    server_name shoestyle.in www.shoestyle.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Install SSL using Certbot:
```bash
sudo certbot --nginx -d shoestyle.in -d www.shoestyle.in
```

---

## 🔍 5. Pre-Flight Verification & Health Check

After deployment, test the following endpoints:

1. **Uptime & DB Health Check**:
   ```bash
   curl -I https://shoestyle.in/api/health
   ```
   *Expected: HTTP 200 OK with `{"status":"healthy","database":{"connected":true}}`.*

2. **Robots & Sitemap**:
   - Visit `https://shoestyle.in/robots.txt` - verify private routes are disallowed.
   - Visit `https://shoestyle.in/sitemap.xml` - verify dynamic URLs and products are present.

3. **Critical E-Commerce User Flows**:
   - [ ] Sign Up / Sign In via Email & Google.
   - [ ] Add Address in Account Page (verify persistence on refresh).
   - [ ] Add Product to Cart (verify accurate sale pricing).
   - [ ] Apply Coupon Code in Cart.
   - [ ] Proceed to Checkout (verify 1-click address selector and express shipping rates).
   - [ ] Complete Test Payment via Razorpay.
   - [ ] Check Admin Observability (`https://shoestyle.in/admin/observability`) for real-time traffic & zero errors.

---

## 🛡️ 6. Scaling & Security Recommendations

1. **Cloudflare CDN / WAF**:
   - Enable Cloudflare proxy (Orange Cloud) for free DDoS protection, HTTP/3, and edge asset caching.
2. **Database Backups**:
   - In Supabase, verify Daily Automated Backups and Point-in-Time Recovery (PITR) are active.
3. **Database Vacuuming**:
   - Autovacuum is enabled by default in Supabase PostgreSQL, ensuring high performance under heavy transaction volume.
