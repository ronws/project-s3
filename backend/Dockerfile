FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy source
COPY src/ ./src/
COPY config/ ./config/

# Security: create non-root user
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/false --create-home nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 4443

CMD ["node", "src/server.js"]
