# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json ./
COPY frontend_client/package*.json ./frontend_client/
COPY shared/package*.json ./shared/

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY shared/ ./shared/
COPY frontend_client/ ./frontend_client/

WORKDIR /app/frontend_client

# Build Next.js application
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package.json ./
COPY frontend_client/package*.json ./frontend_client/
COPY shared/package*.json ./shared/

# Install production dependencies only
RUN npm install --omit=dev

# Copy shared module
COPY shared/ ./shared/

# Copy built Next.js output from builder
COPY --from=builder /app/frontend_client/.next ./frontend_client/.next
COPY --from=builder /app/frontend_client/public ./frontend_client/public
COPY --from=builder /app/frontend_client/next.config.mjs ./frontend_client/next.config.mjs

WORKDIR /app/frontend_client

EXPOSE 3002

CMD ["npm", "start"]