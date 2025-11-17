# Backend - NestJS + Prisma

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` và cấu hình database:
   - Xem hướng dẫn chi tiết trong [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md)
   - Tạo file `.env` với nội dung:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/batdongsan?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN="http://localhost:3001"
   MAX_FILE_SIZE=5242880
   UPLOAD_DEST="./uploads"
   ```

3. **Đảm bảo PostgreSQL đang chạy** và đã tạo database:
   ```sql
   CREATE DATABASE batdongsan;
   ```

4. Chạy Prisma migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Chạy server:
```bash
npm run start:dev
```

Server sẽ chạy tại: http://localhost:3000
API docs (Swagger): http://localhost:3000/api/docs

## Lưu ý

- Backend hiện tại được cấu hình để kết nối với **PostgreSQL localhost** (không phải Supabase)
- Xem [LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md) để biết thêm chi tiết về cấu hình database

## Scripts

- `npm run start:dev` - Chạy development server
- `npm run build` - Build production
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Chạy migrations
- `npm run prisma:studio` - Mở Prisma Studio

## API Endpoints

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user (cần auth)

- `GET /api/properties` - Danh sách bất động sản
- `POST /api/properties` - Tạo mới (cần auth)
- `GET /api/properties/:id` - Chi tiết
- `POST /api/properties/search` - Tìm kiếm nâng cao

- `GET /api/news` - Danh sách tin tức
- `GET /api/news/:id` - Chi tiết tin tức

- `GET /api/locations/provinces` - Danh sách tỉnh/thành
- `GET /api/locations/districts?province_id=xxx` - Quận/huyện
- `GET /api/locations/wards?district_id=xxx` - Phường/xã

