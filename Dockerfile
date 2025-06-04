# Build stage
FROM node:18-slim AS builder

# Set working directory
WORKDIR /app

# Install OpenSSL and other dependencies
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

# Copy package files and prisma schema
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:18-slim

WORKDIR /app

# Install production dependencies and cleanup
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/config ./dist/config

# Create startup script
RUN echo '#!/bin/sh\n\
echo "Starting application..."\n\
node --enable-source-maps --gc-interval=100 --max-semi-space-size=64 dist/server.js & \n\
PID=$!\n\
\n\
echo "Waiting for application to start..."\n\
timeout=60\n\
counter=0\n\
while [ $counter -lt $timeout ]; do\n\
    if curl -s http://localhost:${PORT:-8080}/health > /dev/null; then\n\
        echo "Application successfully started"\n\
        wait $PID\n\
        exit $?\n\
    fi\n\
    sleep 1\n\
    counter=$((counter + 1))\n\
    if [ $((counter % 5)) -eq 0 ]; then\n\
        echo "Still waiting for application to start... ($counter seconds)"\n\
    fi\n\
done\n\
\n\
echo "Application failed to start within $timeout seconds"\n\
kill $PID\n\
exit 1' > /app/start.sh && chmod +x /app/start.sh

# Create necessary directories with proper permissions
RUN mkdir -p uploads relatorios-pdf && \
    chown -R node:node /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV NODE_OPTIONS="--max-old-space-size=512"

# Generate Prisma Client again in production
RUN npx prisma generate

# Switch to non-root user
USER node

# Expose the port
EXPOSE 8080

# Health check with proper timeout and interval
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start the application with the startup script
CMD ["/app/start.sh"]
