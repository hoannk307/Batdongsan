FROM node:20-alpine

WORKDIR /app

# Copy root package.json and workspace package.jsons
COPY package.json ./
COPY frontend_client/package*.json ./frontend_client/
COPY shared/package*.json ./shared/

# Install dependencies
RUN npm install

# Copy all project files
COPY shared/ ./shared/
COPY frontend_client/ ./frontend_client/

WORKDIR /app/frontend_client

RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
    