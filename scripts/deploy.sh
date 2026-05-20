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
DOMAIN="nhatranglands.vn"
EMAIL="nhatrangland.bds@gmail.com"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} Batdongsan Deploy Script${NC}"
echo -e "${GREEN} $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${GREEN}========================================${NC}"

# Navigate to deploy directory
cd "$DEPLOY_DIR"

# ============================================
# Step 0: Ensure SSL certificates exist
# ============================================
echo -e "${YELLOW}[0/6] Checking SSL certificates...${NC}"
CERT_DIR="certbot/conf/live/$DOMAIN"
mkdir -p certbot/conf certbot/www

NEED_LETSENCRYPT=false

if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
    echo -e "  ${YELLOW}SSL certs not found. Creating self-signed placeholder...${NC}"
    mkdir -p "$CERT_DIR"
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/CN=$DOMAIN" 2>/dev/null
    echo -e "  ${GREEN}✓ Self-signed cert created${NC}"
    NEED_LETSENCRYPT=true
elif ! openssl x509 -in "$CERT_DIR/fullchain.pem" -noout -issuer 2>/dev/null | grep -qi "Let's Encrypt\|R3\|R10\|R11\|E5\|E6"; then
    echo -e "  ${YELLOW}Current cert is self-signed, need Let's Encrypt cert${NC}"
    NEED_LETSENCRYPT=true
else
    echo -e "  ${GREEN}✓ Let's Encrypt SSL certificates found${NC}"
fi

# ============================================
# Step 1: Pull latest images
# ============================================
echo -e "${YELLOW}[1/6] Pulling latest images from GHCR...${NC}"
docker compose -f "$COMPOSE_FILE" pull backend frontend_admin frontend_client

# ============================================
# Step 2: Restart services with new images
# ============================================
echo -e "${YELLOW}[2/6] Restarting services...${NC}"
docker compose -f "$COMPOSE_FILE" up -d --no-build --remove-orphans

# ============================================
# Step 3: Get Let's Encrypt SSL (if needed)
# ============================================
if [ "$NEED_LETSENCRYPT" = true ]; then
    echo -e "${YELLOW}[3/6] Obtaining Let's Encrypt SSL certificate...${NC}"

    # Wait for nginx to be ready
    sleep 5

    # Remove self-signed cert
    rm -rf "$CERT_DIR"

    # Request real cert from Let's Encrypt
    if docker compose -f "$COMPOSE_FILE" run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" \
        -d "admin.$DOMAIN" \
        -d "api.$DOMAIN"; then
        echo -e "  ${GREEN}✓ Let's Encrypt SSL certificate obtained!${NC}"
        # Reload nginx with real cert
        docker compose -f "$COMPOSE_FILE" exec -T nginx nginx -s reload || \
            docker compose -f "$COMPOSE_FILE" restart nginx
        echo -e "  ${GREEN}✓ Nginx reloaded with SSL cert${NC}"
    else
        echo -e "  ${RED}✗ Failed to obtain Let's Encrypt cert${NC}"
        echo -e "  ${YELLOW}  Site will use self-signed cert. Check:${NC}"
        echo -e "  ${YELLOW}  - DNS records point to this server${NC}"
        echo -e "  ${YELLOW}  - Port 80 is open from the internet${NC}"
        echo -e "  ${YELLOW}  Re-run: bash scripts/init-ssl.sh${NC}"
        # Recreate self-signed so nginx can still run
        mkdir -p "$CERT_DIR"
        openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
            -keyout "$CERT_DIR/privkey.pem" \
            -out "$CERT_DIR/fullchain.pem" \
            -subj "/CN=$DOMAIN" 2>/dev/null
        docker compose -f "$COMPOSE_FILE" restart nginx
    fi
else
    echo -e "${YELLOW}[3/6] SSL already configured, skipping...${NC}"
fi

# ============================================
# Step 4: Run database migrations
# ============================================
echo -e "${YELLOW}[4/6] Running database migrations...${NC}"
# Wait for database to be ready
sleep 5
docker compose -f "$COMPOSE_FILE" exec -T backend npx prisma migrate deploy || {
    echo -e "${YELLOW}  Migration skipped (no pending migrations or first deploy)${NC}"
}

# ============================================
# Step 5: Health check with retries
# ============================================
echo -e "${YELLOW}[5/6] Running health checks (waiting for services to start)...${NC}"

# Function: check a service with retries
check_service() {
    local name="$1"
    local url="$2"
    local container="$3"
    local max_retries=6
    local wait_seconds=10

    for i in $(seq 1 $max_retries); do
        if curl -sf "$url" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓ $name is healthy${NC}"
            return 0
        fi
        if [ "$i" -lt "$max_retries" ]; then
            echo -e "  ${YELLOW}  $name not ready, retry $i/$max_retries (waiting ${wait_seconds}s)...${NC}"
            sleep "$wait_seconds"
        fi
    done

    echo -e "  ${RED}✗ $name health check failed after $max_retries attempts${NC}"
    # Print last 30 lines of logs for debugging
    echo -e "  ${RED}--- $name container logs (last 30 lines) ---${NC}"
    docker compose -f "$COMPOSE_FILE" logs --tail=30 "$container" 2>&1 || true
    echo -e "  ${RED}--- end logs ---${NC}"
    return 1
}

HEALTH_OK=true

# Initial wait for containers to initialize
sleep 10

# Check backend
check_service "Backend" "http://localhost:3000/api/docs" "backend" || HEALTH_OK=false

# Check frontend_admin
check_service "Frontend Admin" "http://localhost:3001" "frontend_admin" || HEALTH_OK=false

# Check frontend_client
check_service "Frontend Client" "http://localhost:3002" "frontend_client" || HEALTH_OK=false

# ============================================
# Step 6: Cleanup old images
# ============================================
echo -e "${YELLOW}[6/6] Cleaning up old Docker images...${NC}"
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
