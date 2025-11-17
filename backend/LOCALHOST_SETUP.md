# HƯỚNG DẪN CẤU HÌNH LOCALHOST DATABASE

## Cấu hình Database Localhost

Backend đã được cập nhật để kết nối với PostgreSQL localhost thay vì Supabase.

### Bước 1: Tạo file .env

Tạo file `.env` trong thư mục `backend` với nội dung sau:

```env
# Database Configuration - Localhost PostgreSQL
# Format: postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/batdongsan?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:3001"

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DEST="./uploads"
```

### Bước 2: Cài đặt và cấu hình PostgreSQL

1. **Cài đặt PostgreSQL** (nếu chưa có):
   - Windows: Tải từ https://www.postgresql.org/download/windows/
   - Hoặc sử dụng Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

2. **Tạo database**:
   ```sql
   CREATE DATABASE batdongsan;
   ```

3. **Cập nhật DATABASE_URL** trong file `.env`:
   - Thay `postgres` bằng username của bạn
   - Thay `postgres` (password) bằng password của bạn
   - Thay `batdongsan` bằng tên database bạn muốn sử dụng

### Bước 3: Chạy Migrations

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Chạy migrations để tạo tables
npm run prisma:migrate
```

### Bước 4: Chạy Backend

```bash
npm run start:dev
```

Backend sẽ kết nối với PostgreSQL localhost tại `localhost:5432`.

## Lưu ý

- Đảm bảo PostgreSQL đang chạy trước khi start backend
- Kiểm tra port 5432 có đang được sử dụng không
- Nếu dùng port khác, cập nhật DATABASE_URL trong file `.env`

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra PostgreSQL đã chạy chưa: `pg_isready` hoặc `psql -U postgres`
- Kiểm tra thông tin kết nối trong `.env` (username, password, database name)
- Đảm bảo database đã được tạo

### Lỗi authentication
- Kiểm tra username và password trong DATABASE_URL
- Kiểm tra file `pg_hba.conf` của PostgreSQL nếu cần

