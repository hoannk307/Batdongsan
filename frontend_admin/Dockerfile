# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# NEXT_PUBLIC_* vars phải có tại build time vì Next.js inline chúng vào bundle
ARG NEXT_PUBLIC_API_URL=https://api.nhatranglands.vn
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files first for better Docker layer caching
COPY package.json ./
COPY frontend_admin/package*.json ./frontend_admin/
COPY shared/package*.json ./shared/

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY shared/ ./shared/
COPY frontend_admin/ ./frontend_admin/

WORKDIR /app/frontend_admin

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
COPY frontend_admin/package*.json ./frontend_admin/
COPY shared/package*.json ./shared/

# Install production dependencies only
RUN npm install --omit=dev

# Copy shared module
COPY shared/ ./shared/

# Copy built Next.js output from builder
COPY --from=builder /app/frontend_admin/.next ./frontend_admin/.next
COPY --from=builder /app/frontend_admin/public ./frontend_admin/public
COPY --from=builder /app/frontend_admin/next.config.mjs ./frontend_admin/next.config.mjs

WORKDIR /app/frontend_admin

EXPOSE 3001

CMD ["npm", "start"]
