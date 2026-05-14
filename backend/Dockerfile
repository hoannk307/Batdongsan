# Sử dụng Node LTS
FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace package.jsons
COPY package.json ./
COPY backend/package*.json ./backend/
COPY shared/package*.json ./shared/

# Install dependencies (NPM Workspaces will link everything)
RUN npm install

# Copy all project files
COPY shared/ ./shared/
COPY backend/ ./backend/

WORKDIR /app/backend

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
