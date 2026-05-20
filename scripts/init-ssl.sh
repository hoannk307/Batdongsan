#!/bin/bash
set -e

# ============================================
# SSL Certificate Initialization Script
# Sử dụng Certbot (Let's Encrypt) để lấy SSL miễn phí
# ============================================
# Chạy script này trên SERVER lần đầu tiên để lấy chứng chỉ SSL
# Sau đó Certbot container sẽ tự động gia hạn

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DEPLOY_DIR="/opt/batdongsan"
COMPOSE_FILE="docker-compose.deploy.yml"

# Domain chính và các subdomain
DOMAINS="-d nhatranglands.vn -d www.nhatranglands.vn -d admin.nhatranglands.vn -d api.nhatranglands.vn"
EMAIL="nhatrangland.bds@gmail.com"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} SSL Certificate Setup${NC}"
echo -e "${GREEN} $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${GREEN}========================================${NC}"

cd "$DEPLOY_DIR"

# ============================================
# Bước 1: Tạo thư mục cần thiết
# ============================================
echo -e "${YELLOW}[1/5] Tạo thư mục certbot...${NC}"
mkdir -p certbot/conf
mkdir -p certbot/www

# ============================================
# Bước 2: Tạo self-signed cert tạm thời (để Nginx khởi động được)
# ============================================
echo -e "${YELLOW}[2/5] Tạo self-signed certificate tạm thời...${NC}"

CERT_DIR="certbot/conf/live/nhatranglands.vn"

if [ ! -f "$CERT_DIR/fullchain.pem" ]; then
    mkdir -p "$CERT_DIR"
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/CN=nhatranglands.vn"
    echo -e "  ${GREEN}✓ Self-signed cert đã tạo${NC}"
else
    echo -e "  ${YELLOW}→ Certificate đã tồn tại, bỏ qua${NC}"
fi

# ============================================
# Bước 3: Khởi động Nginx với cert tạm
# ============================================
echo -e "${YELLOW}[3/5] Khởi động Nginx...${NC}"
docker compose -f "$COMPOSE_FILE" up -d nginx
sleep 5
echo -e "  ${GREEN}✓ Nginx đã khởi động${NC}"

# ============================================
# Bước 4: Xóa cert tạm và lấy cert thật từ Let's Encrypt
# ============================================
echo -e "${YELLOW}[4/5] Lấy chứng chỉ SSL từ Let's Encrypt...${NC}"

# Xóa cert tạm
rm -rf "$CERT_DIR"

# Chạy certbot để lấy cert thật
docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "certbot" certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    $DOMAINS

if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓ Chứng chỉ SSL đã được cấp thành công!${NC}"
else
    echo -e "  ${RED}✗ Lỗi khi lấy chứng chỉ SSL${NC}"
    echo -e "  ${RED}  Kiểm tra DNS đã trỏ đúng IP server chưa${NC}"
    exit 1
fi

# ============================================
# Bước 5: Reload Nginx với cert thật
# ============================================
echo -e "${YELLOW}[5/5] Reload Nginx với SSL cert mới...${NC}"
docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload
sleep 2

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} ✓ SSL Setup hoàn tất!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Truy cập:"
echo -e "  ${GREEN}https://nhatranglands.vn${NC}         → Frontend Client"
echo -e "  ${GREEN}https://admin.nhatranglands.vn${NC}   → Frontend Admin"
echo -e "  ${GREEN}https://api.nhatranglands.vn${NC}     → Backend API"
echo ""
echo -e "${YELLOW}Chứng chỉ sẽ tự động gia hạn bởi Certbot container.${NC}"
