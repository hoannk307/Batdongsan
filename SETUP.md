# HƯỚNG DẪN SETUP DỰ ÁN

## Yêu cầu hệ thống

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

## Bước 1: Setup Backend

1. Vào thư mục backend:
```bash
cd backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env`:
```bash
cp .env.batdongsan .env
```

4. Cấu hình database trong `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/batdongsan?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:3001"
```

5. Tạo database PostgreSQL:
```sql
CREATE DATABASE batdongsan;
```

6. Chạy Prisma migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

7. Chạy backend:
```bash
npm run start:dev
```

Backend sẽ chạy tại: http://localhost:3000
API docs: http://localhost:3000/api/docs

## Bước 2: Setup Frontend

1. Mở terminal mới, vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env.local`:
```bash
cp .env.example .env.local
```

4. Cấu hình API URL trong `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

5. Chạy frontend:
```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3001

## Kiểm tra

1. Mở browser và truy cập: http://localhost:3001
2. Kiểm tra API docs: http://localhost:3000/api/docs

## Troubleshooting

### Lỗi kết nối database
- **Nếu dùng Supabase**: Xem `SUPABASE_SETUP.md` để kiểm tra connection string
- **Nếu dùng Local PostgreSQL**: 
  - Kiểm tra PostgreSQL đã chạy chưa
  - Kiểm tra thông tin kết nối trong `.env`
  - Đảm bảo database đã được tạo

### Lỗi CORS
- Kiểm tra `CORS_ORIGIN` trong backend `.env`
- Đảm bảo frontend URL khớp với `CORS_ORIGIN`

### Lỗi Prisma
- Chạy lại: `npm run prisma:generate`
- Kiểm tra schema trong `backend/prisma/schema.prisma`

## Next Steps

1. Seed data (tùy chọn): Tạo file `backend/prisma/seed.ts` để thêm dữ liệu mẫu
2. Cấu hình file upload: Cập nhật `backend/src/upload/upload.service.ts`
3. Thêm authentication guards cho các routes cần thiết
4. Tùy chỉnh UI components theo thiết kế

