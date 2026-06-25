# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# NEXT_PUBLIC_* vars phải có tại build time vì Next.js inline chúng vào bundle
ARG NEXT_PUBLIC_API_URL=https://api.nhatranglands.vn
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_TINYMCE_API_KEY
ENV NEXT_PUBLIC_TINYMCE_API_KEY=$NEXT_PUBLIC_TINYMCE_API_KEY

# Copy lock file + package files
COPY package.json package-lock.json ./
COPY frontend_admin/package.json ./frontend_admin/
COPY shared/package.json ./shared/

# Builder stage: cài đầy đủ deps (bao gồm devDeps như sass) để build được
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

# Tạo user non-root để chạy app (không chạy với quyền root)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy lock file + package files
COPY package.json package-lock.json ./
COPY frontend_admin/package.json ./frontend_admin/
COPY shared/package.json ./shared/

# Chỉ cài production deps, dùng lock file, không chạy scripts
RUN npm install --omit=dev --ignore-scripts && \
    npm rebuild sharp 2>/dev/null || true

# Copy shared module
COPY shared/ ./shared/

# Copy built Next.js output từ builder stage
COPY --from=builder /app/frontend_admin/.next ./frontend_admin/.next
COPY --from=builder /app/frontend_admin/public ./frontend_admin/public
COPY --from=builder /app/frontend_admin/next.config.mjs ./frontend_admin/next.config.mjs

# Set ownership cho nextjs user
RUN chown -R nextjs:nodejs /app/frontend_admin/.next

WORKDIR /app/frontend_admin

# Chạy với user non-root
USER nextjs

EXPOSE 3001

CMD ["npm", "start"]
