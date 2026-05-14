FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace package.jsons
COPY package.json ./
COPY frontend_admin/package*.json ./frontend_admin/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install

# Copy all project files
COPY shared/ ./shared/
COPY frontend_admin/ ./frontend_admin/

WORKDIR /app/frontend_admin

RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
