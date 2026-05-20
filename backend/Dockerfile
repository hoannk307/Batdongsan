# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY shared/ ./shared/
COPY backend/ ./backend/

WORKDIR /app/backend

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS application
RUN npm run build

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package files
COPY package.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install production dependencies only
RUN npm install --omit=dev

# Copy shared module
COPY shared/ ./shared/

# Copy built output from builder
COPY --from=builder /app/backend/dist ./backend/dist

# Copy Prisma schema and migrations (needed for prisma migrate deploy)
COPY --from=builder /app/backend/prisma ./backend/prisma

# Copy generated Prisma Client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "dist/main"]
