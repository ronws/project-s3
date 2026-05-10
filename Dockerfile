FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Backend deps
COPY backend/package.json backend/package-lock.json* ./backend/
RUN npm ci --prefix backend

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY . .

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: create non-root user
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/false --create-home nodejs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

RUN mkdir .next && chown -R nodejs:nodejs .

USER nodejs

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
