#!/bin/bash
set -e

# ============================================
# Batdongsan CI/CD Deploy Script
# Called by GitHub Actions after images are pushed to GHCR
# ============================================

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

DEPLOY_DIR="/opt/batdongsan"
COMPOSE_FILE="docker-compose.deploy.yml"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} Batdongsan Deploy Script${NC}"
echo -e "${GREEN} $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${GREEN}========================================${NC}"

# Navigate to deploy directory
cd "$DEPLOY_DIR"

# Step 1: Pull latest images
echo -e "${YELLOW}[1/5] Pulling latest images from GHCR...${NC}"
docker compose -f "$COMPOSE_FILE" pull backend frontend_admin frontend_client

# Step 2: Restart services with new images
echo -e "${YELLOW}[2/5] Restarting services...${NC}"
docker compose -f "$COMPOSE_FILE" up -d --no-build --remove-orphans

# Step 3: Run database migrations
echo -e "${YELLOW}[3/5] Running database migrations...${NC}"
# Wait for database to be ready
sleep 5
docker compose -f "$COMPOSE_FILE" exec -T backend npx prisma migrate deploy || {
    echo -e "${YELLOW}  Migration skipped (no pending migrations or first deploy)${NC}"
}

# Step 4: Health check
echo -e "${YELLOW}[4/5] Running health checks...${NC}"
sleep 10

HEALTH_OK=true

# Check backend
if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "  ${RED}✗ Backend health check failed${NC}"
    HEALTH_OK=false
fi

# Check frontend_admin
if curl -sf http://localhost:3001 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Frontend Admin is healthy${NC}"
else
    echo -e "  ${RED}✗ Frontend Admin health check failed${NC}"
    HEALTH_OK=false
fi

# Check frontend_client
if curl -sf http://localhost:3002 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Frontend Client is healthy${NC}"
else
    echo -e "  ${RED}✗ Frontend Client health check failed${NC}"
    HEALTH_OK=false
fi

# Step 5: Cleanup old images
echo -e "${YELLOW}[5/5] Cleaning up old Docker images...${NC}"
docker image prune -f

echo ""
if [ "$HEALTH_OK" = true ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN} ✓ Deploy completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED} ⚠ Deploy completed with warnings${NC}"
    echo -e "${RED} Some health checks failed.${NC}"
    echo -e "${RED} Check logs: docker compose -f $COMPOSE_FILE logs -f${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
