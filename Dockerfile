# 1. Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --ignore-scripts && pnpm approve-builds --all && pnpm rebuild

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

RUN npm install -g pnpm && pnpm exec next build

# 3. Run stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm

COPY --from=builder /app ./

EXPOSE 3000

CMD ["pnpm", "start"]
