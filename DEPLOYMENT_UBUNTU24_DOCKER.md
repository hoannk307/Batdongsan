# Hướng Dẫn Deploy Dự Án Bất Động Sản Với Docker Lên Ubuntu Server 24

Tài liệu này hướng dẫn chi tiết các bước để đưa dự án của bạn (Database, Backend, Frontend) lên môi trường Production sử dụng VPS chạy **Ubuntu Server 24.04 LTS** bằng Docker thuần.

## Bước 1: Kết nối vào máy chủ Ubuntu 24

Sử dụng Terminal (hoặc PowerShell, PuTTY trên Windows) để SSH vào VPS của bạn:

```bash
ssh username@ip_cua_server
```
*(Thay `username` thường là `root` hoặc `ubuntu`, và `ip_cua_server` bằng địa chỉ IP VPS của bạn)*

## Bước 2: Cập nhật hệ thống và cài đặt Docker

Sau khi đăng nhập vào Ubuntu, chạy các lệnh sau để cài đặt Docker và Docker Compose bản mới nhất:

```bash
# 1. Cập nhật danh sách gói phần mềm
sudo apt update && sudo apt upgrade -y

# 2. Cài đặt các gói phụ thuộc cần thiết
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# 3. Thêm GPG key chính thức của Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 4. Thêm repository của Docker vào APT sources
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Cập nhật lại danh sách gói và cài đặt Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# 6. Kích hoạt Docker chạy cùng hệ thống và khởi động nó
sudo systemctl enable docker
sudo systemctl start docker
```

Kiểm tra xem Docker đã cài đặt thành công chưa:
```bash
docker --version
docker compose version
```

## Bước 3: Đưa mã nguồn lên Server

Bạn có thể dùng Git để clone dự án từ GitHub/GitLab về server:

```bash
# Cài đặt git nếu chưa có
sudo apt install git -y

# Clone dự án (Thay bằng link git thực tế của bạn)
git clone https://github.com/your-username/batdongsan.git
cd batdongsan
```
*(Hoặc dùng phần mềm như WinSCP / FileZilla / rsync để copy toàn bộ thư mục code hiện tại từ máy tính lên Server)*

## Bước 4: Cấu hình biến môi trường (.env)

Tạo file `.env` trên server:

```bash
nano .env
```

Dán nội dung sau vào và chỉnh sửa lại các thông tin cho phù hợp (đặc biệt là mật khẩu phải bảo mật):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=MatKhauBaoMatCuaBan
POSTGRES_DB=batdongsan
POSTGRES_PORT=5432

BACKEND_PORT=3000
FRONTEND_ADMIN_PORT=3001
FRONTEND_CLIENT_PORT=3002

JWT_SECRET=TaoMotChuoiBiMatNgauNhienDaiVaKhoDoan
JWT_EXPIRES_IN=7d

# QUAN TRỌNG: Điền IP của server (ví dụ: http://123.45.67.89:3000) hoặc tên miền API
NEXT_PUBLIC_API_URL=http://ip_cua_server:3000 
```
Nhấn `Ctrl+O` rồi `Enter` để lưu, sau đó `Ctrl+X` để thoát.

## Bước 5: Mở cổng (Ports) trong docker-compose.prod.yml

Theo như cấu hình trong `docker-compose.prod.yml` hiện hành, các phần `ports` đã bị comment (`#`) do trước đó bạn dự tính dùng Coolify (có sẵn Traefik). 
Khi chạy Docker thuần trên Ubuntu, bạn **CẦN MỞ COMMENT** các port này để có thể truy cập dự án.

Mở file để chỉnh sửa:
```bash
nano docker-compose.prod.yml
```

Tìm đến các dịch vụ (`backend`, `frontend_admin`, `frontend_client`) và bỏ dấu `#` trước `ports` và các cổng tương ứng:

```yaml
  backend:
    # ... các cấu hình khác ...
    ports:
      - "3000:3000"

  frontend_admin:
    # ... các cấu hình khác ...
    ports:
      - "3001:3000" # Hoặc 3001:3001 tùy vào Dockerfile của bạn

  frontend_client:
    # ... các cấu hình khác ...
    ports:
      - "3002:3000" # Hoặc 3002:3002 tùy vào Dockerfile của bạn
```

**Lưu ý quan trọng:**
**Không** mở port ra ngoài cho service `database` (giữ nguyên comment cho port 5432) để tránh việc DB của bạn bị scan và tấn công từ Internet. Các container vẫn kết nối được với nhau thông qua mạng nội bộ của Docker.

## Bước 6: Build và Khởi chạy dự án

Chạy hệ thống ở chế độ background (`-d`) và trỏ vào file production:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Kiểm tra trạng thái các container xem có đang `Up` không:
```bash
docker compose -f docker-compose.prod.yml ps
```

Xem log để rà soát lỗi nếu container không chạy:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

## Bước 7: Truy cập dự án

Sau khi khởi chạy thành công, hãy mở trình duyệt và truy cập hệ thống của bạn qua địa chỉ IP của VPS:

*   **API Backend:** `http://ip_cua_server:3000`
*   **Trang Admin:** `http://ip_cua_server:3001`
*   **Trang Client (Khách hàng):** `http://ip_cua_server:3002`

---

### Bước Tiếp Theo (Khuyên dùng cho Production thực tế)
Sau khi dự án chạy ổn định qua IP và Port, để đưa vào hoạt động chuyên nghiệp bạn không nên bắt người dùng phải gõ số Port. Thay vào đó, bạn nên:
1. Trỏ các tên miền (vd: `api.domain.com`, `admin.domain.com`, `domain.com`) về IP của Server.
2. Cài đặt **Nginx** trên Ubuntu làm Reverse Proxy để điều hướng request từ port 80/443 vào các port 3000, 3001, 3002 của Docker.
3. Cài đặt **Certbot (Let's Encrypt)** để cấu hình tự động chứng chỉ bảo mật HTTPS (SSL) miễn phí.
