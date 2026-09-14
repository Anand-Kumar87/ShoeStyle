# ==============================================================================
# 🐳 Production Multi-Stage Dockerfile for ShoeStyle (Next.js + Prisma)
# ==============================================================================

# Stage 1: Base image with OpenSSL for Prisma & Node.js 20
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Stage 2: Dependencies Installation
FROM base AS deps
WORKDIR /app

# Copy dependency manifests and Prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies and pre-generate Prisma client
RUN npm install --legacy-peer-deps

# Stage 3: Application Builder
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Enable standalone output & disable Next telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT_STANDALONE=true
ENV NODE_ENV=production

# Re-generate Prisma Client inside builder
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Stage 4: Production Runner (Ultra-lightweight ~150MB)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create secure non-root system user and group
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 -g nodejs nextjs

# Copy public assets & static build files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set correct permissions
USER nextjs

EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "server.js"]