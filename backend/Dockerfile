# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json, but override workspaces to only include backend & shared
COPY package.json ./package.json.original

# Create a modified root package.json with only backend + shared workspaces
RUN node -e " \
  const pkg = JSON.parse(require('fs').readFileSync('./package.json.original','utf8')); \
  pkg.workspaces = ['backend','shared']; \
  require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));"

# Copy package files for workspace resolution
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY shared/ ./shared/
COPY backend/ ./backend/

WORKDIR /app/backend

# Generate Prisma Client (dummy URL - prisma generate doesn't connect to DB)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Build NestJS application
RUN npm run build

# Verify build output exists
RUN ls -la dist/ && test -f dist/main.js && echo "✅ Build successful: dist/main.js exists"

# ============================================
# Stage 2: Production
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Same workspace trick for production
COPY package.json ./package.json.original
RUN node -e " \
  const pkg = JSON.parse(require('fs').readFileSync('./package.json.original','utf8')); \
  pkg.workspaces = ['backend','shared']; \
  require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));"

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
