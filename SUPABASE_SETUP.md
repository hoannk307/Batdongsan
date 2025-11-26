# HƯỚNG DẪN KẾT NỐI VỚI SUPABASE

## Supabase là gì?

[Supabase](https://supabase.com/) là một nền tảng Backend-as-a-Service (BaaS) cung cấp PostgreSQL database trên cloud, cùng với các tính năng như Authentication, Storage, Realtime, và Edge Functions.

## Bước 1: Tạo Project trên Supabase

1. Truy cập https://supabase.com/
2. Đăng ký/Đăng nhập tài khoản
3. Click **"Start your project"** hoặc **"New Project"**
4. Điền thông tin:
   - **Name**: Tên project (ví dụ: `batdongsan`)
   - **Database Password**: Đặt mật khẩu mạnh cho database (lưu lại mật khẩu này!)
   - **Region**: Chọn region gần bạn nhất (ví dụ: `Southeast Asia (Singapore)`)
   - **Pricing Plan**: Chọn plan phù hợp (Free tier có sẵn)
5. Click **"Create new project"** và đợi Supabase setup (khoảng 2-3 phút)

## Bước 2: Lấy Connection String

1. Vào **Project Settings** (icon bánh răng ở sidebar trái)
2. Chọn tab **Database**
3. Scroll xuống phần **Connection string**
4. Chọn tab **URI** hoặc **Connection pooling**
5. Copy connection string, sẽ có dạng:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
   hoặc với connection pooling:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

**Lưu ý**: 
- Thay `[YOUR-PASSWORD]` bằng mật khẩu bạn đã đặt khi tạo project
- Connection pooling (port 6543) được khuyến nghị cho production
- Direct connection (port 5432) dùng cho migrations và development

## Bước 3: Cấu hình Backend

### 3.1. Cập nhật file `.env` trong backend

Mở file `backend/.env` và cập nhật `DATABASE_URL`:

```env
# Supabase Connection String
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Hoặc dùng Connection Pooling (khuyến nghị cho production)
# DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3001"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DEST="./uploads"
```

**Ví dụ thực tế:**
```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:MyPassword123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

### 3.2. Cập nhật Prisma Schema (nếu cần)

File `backend/prisma/schema.prisma` đã được cấu hình đúng với PostgreSQL, không cần thay đổi:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Bước 4: Chạy Migrations

1. Vào thư mục backend:
```bash
cd backend
```

2. Generate Prisma Client:
```bash
npm run prisma:generate
```

3. Chạy migrations để tạo tables:
```bash
npm run prisma:migrate
```

Khi chạy lần đầu, Prisma sẽ hỏi tên migration, ví dụ: `init`

4. Kiểm tra database trên Supabase:
   - Vào **Table Editor** trên Supabase Dashboard
   - Bạn sẽ thấy các tables đã được tạo: `users`, `properties`, `property_images`, `news`, `locations`, `favorites`

## Bước 5: Kiểm tra kết nối

1. Chạy backend:
```bash
npm run start:dev
```

2. Nếu không có lỗi, kết nối đã thành công!

3. Test API:
   - Mở http://localhost:3000/api/docs
   - Thử đăng ký user mới qua API

## Bước 6: Sử dụng Prisma Studio (Tùy chọn)

Để xem và quản lý data trực quan:

```bash
npm run prisma:studio
```

Prisma Studio sẽ mở tại http://localhost:5555

## Lưu ý quan trọng

### 1. Connection Pooling
- Supabase khuyến nghị dùng **Connection Pooling** (port 6543) cho production
- Direct connection (port 5432) chỉ dùng cho migrations
- Thêm `?pgbouncer=true&connection_limit=1` vào connection string khi dùng pooling

### 2. SSL Connection
Supabase yêu cầu SSL. Prisma tự động xử lý điều này, nhưng nếu gặp lỗi, thêm vào connection string:
```
?sslmode=require
```

### 3. Environment Variables
- **KHÔNG** commit file `.env` lên Git
- Sử dụng `.env.example` làm template
- Trên production, dùng environment variables của hosting platform

### 4. Database Password
- Lưu mật khẩu database ở nơi an toàn
- Có thể reset password trong Supabase Dashboard nếu quên

## Troubleshooting

### Lỗi: "Connection refused" hoặc "Timeout"
- Kiểm tra connection string đúng chưa
- Kiểm tra password đã thay thế chưa
- Kiểm tra firewall/network có chặn không
- Thử dùng Connection Pooling thay vì Direct connection

### Lỗi: "SSL required"
Thêm vào connection string:
```
?sslmode=require
```

### Lỗi: "Too many connections"
- Sử dụng Connection Pooling (port 6543)
- Kiểm tra connection limit trong code
- Đảm bảo đóng connections sau khi dùng xong

### Lỗi Migration
- Đảm bảo dùng Direct connection (port 5432) cho migrations
- Kiểm tra quyền của database user
- Xem logs trong Supabase Dashboard

## Tài nguyên

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-supabase)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

## Kết luận

Sau khi hoàn thành các bước trên, backend của bạn đã được kết nối với Supabase PostgreSQL database. Bạn có thể:

- ✅ Sử dụng Prisma để query database
- ✅ Chạy migrations
- ✅ Quản lý data qua Supabase Dashboard
- ✅ Sử dụng các tính năng khác của Supabase (Auth, Storage, Realtime...)















