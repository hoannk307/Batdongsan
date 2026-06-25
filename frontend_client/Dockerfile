# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# NEXT_PUBLIC_* vars phải có tại build time vì Next.js inline chúng vào bundle
ARG NEXT_PUBLIC_API_URL=https://api.nhatranglands.vn
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy lock file + package files (lock file phải tồn tại để npm ci hoạt động chính xác)
COPY package.json package-lock.json ./
COPY frontend_client/package.json ./frontend_client/
COPY shared/package.json ./shared/

# npm ci sử dụng package-lock.json để cài đúng phiên bản, --ignore-scripts ngăn postinstall độc hại
RUN npm ci --ignore-scripts

# Re-run scripts chỉ cho các packages native cần thiết (sharp, esbuild)
RUN npm rebuild sharp esbuild 2>/dev/null || true

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

# Tạo user non-root để chạy app (không chạy với quyền root)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy lock file + package files
COPY package.json package-lock.json ./
COPY frontend_client/package.json ./frontend_client/
COPY shared/package.json ./shared/

# Chỉ cài production deps, dùng lock file chính xác, không chạy scripts
RUN npm ci --omit=dev --ignore-scripts && \
    npm rebuild sharp 2>/dev/null || true

# Copy shared module
COPY shared/ ./shared/

# Copy built Next.js output từ builder stage
COPY --from=builder /app/frontend_client/.next ./frontend_client/.next
COPY --from=builder /app/frontend_client/public ./frontend_client/public
COPY --from=builder /app/frontend_client/next.config.mjs ./frontend_client/next.config.mjs

# Set ownership cho nextjs user
RUN chown -R nextjs:nodejs /app/frontend_client/.next

WORKDIR /app/frontend_client

# Chạy với user non-root
USER nextjs

EXPOSE 3002

CMD ["npm", "start"]
