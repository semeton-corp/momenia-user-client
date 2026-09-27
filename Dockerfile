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
ARG NEXT_PUBLIC_PROMOTIONAL_PAGE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FEATURE_MUSIC=$NEXT_PUBLIC_FEATURE_MUSIC
ENV NEXT_PUBLIC_FEATURE_PAYMENT_ADDONS=$NEXT_PUBLIC_FEATURE_PAYMENT_ADDONS
ENV NEXT_PUBLIC_PROMOTIONAL_PAGE=$NEXT_PUBLIC_PROMOTIONAL_PAGE

RUN npx next build --webpack

# 3. Run stage
FROM node:20-alpine AS runner
WORKDIR /app

# Patch OS packages (e.g. openssl) to latest fixed version for this alpine release.
RUN apk upgrade --no-cache

# node:20-alpine ships npm's own CLI preinstalled; its bundled deps (tar, sigstore,
# glob, minimatch, ...) show up in image scans even though `node server.js` never
# invokes npm/npx at runtime, so drop them.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

ENV NODE_ENV=production
# Docker always injects HOSTNAME=<container-id> into every container, which
# pre-empts standalone server.js's own `process.env.HOSTNAME || '0.0.0.0'`
# fallback — without this override the server binds to the container-id
# hostname instead of all interfaces and nothing (not even localhost) can
# reach it.
ENV HOSTNAME="0.0.0.0"

# Standalone output only traces production-runtime deps, so dev-only tooling
# (shadcn CLI, msw, etc.) and their vulnerable transitive deps never ship.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
