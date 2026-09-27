# 1. Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# 2. Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FEATURE_MUSIC
ARG NEXT_PUBLIC_FEATURE_PAYMENT_ADDONS
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FEATURE_MUSIC=$NEXT_PUBLIC_FEATURE_MUSIC
ENV NEXT_PUBLIC_FEATURE_PAYMENT_ADDONS=$NEXT_PUBLIC_FEATURE_PAYMENT_ADDONS

RUN npx next build --webpack

# 3. Run stage
FROM node:20-alpine AS runner
WORKDIR /app

# Patch OS packages (e.g. openssl) to latest fixed version for this alpine release.
RUN apk upgrade --no-cache

ENV NODE_ENV=production

# Standalone output only traces production-runtime deps, so dev-only tooling
# (shadcn CLI, msw, etc.) and their vulnerable transitive deps never ship.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
