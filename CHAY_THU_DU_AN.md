# HƯỚNG DẪN CHẠY THỬ DỰ ÁN

## Yêu cầu trước khi chạy

- ✅ Node.js >= 18.x đã cài đặt
- ✅ PostgreSQL database (Supabase hoặc local) đã setup
- ✅ File `.env` trong thư mục `backend` đã được cấu hình

## Bước 1: Kiểm tra Database Connection

### Nếu dùng Supabase:
1. Đảm bảo đã có file `backend/.env` với `DATABASE_URL` đúng format
2. Xem hướng dẫn trong `SUPABASE_SETUP.md` nếu chưa setup

### Nếu dùng PostgreSQL local:
1. Đảm bảo PostgreSQL đã chạy
2. Đã tạo database `batdongsan`
3. File `backend/.env` có `DATABASE_URL` đúng

## Bước 2: Setup Backend

### 2.1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2.2. Cấu hình Database

Đảm bảo file `backend/.env` có nội dung:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3001"
```

### 2.3. Chạy Prisma Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Chạy migrations để tạo tables
npm run prisma:migrate
```

Khi chạy migration lần đầu, Prisma sẽ hỏi tên migration, nhập: `init`

### 2.4. Chạy Backend Server

```bash
npm run start:dev
```

Backend sẽ chạy tại: **http://localhost:3000**

Kiểm tra:
- API: http://localhost:3000/api
- Swagger docs: http://localhost:3000/api/docs

## Bước 3: Setup Frontend

### 3.1. Mở Terminal mới

Giữ terminal backend đang chạy, mở terminal mới cho frontend.

### 3.2. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 3.3. Cấu hình Environment

Tạo file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3.4. Chạy Frontend

```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3001**

## Bước 4: Kiểm tra

### 4.1. Kiểm tra Backend

1. Mở browser: http://localhost:3000/api/docs
2. Bạn sẽ thấy Swagger UI với các API endpoints
3. Thử test API:
   - `GET /api/properties` - Lấy danh sách bất động sản
   - `POST /api/auth/register` - Đăng ký user mới

### 4.2. Kiểm tra Frontend

1. Mở browser: http://localhost:3001
2. Bạn sẽ thấy trang chủ với form tìm kiếm
3. Kiểm tra các trang:
   - Trang chủ: http://localhost:3001
   - Tìm kiếm: http://localhost:3001/properties
   - Đăng nhập: http://localhost:3001/login

## Bước 5: Test các chức năng cơ bản

### 5.1. Đăng ký User mới

**Qua Swagger (http://localhost:3000/api/docs):**
1. Tìm endpoint `POST /api/auth/register`
2. Click "Try it out"
3. Nhập thông tin:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```
4. Click "Execute"
5. Lưu lại `token` từ response

### 5.2. Đăng nhập

**Qua Swagger:**
1. Tìm endpoint `POST /api/auth/login`
2. Nhập:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
3. Lưu lại `token`

### 5.3. Tạo Bất động sản (cần đăng nhập)

**Qua Swagger:**
1. Tìm endpoint `POST /api/properties`
2. Click "Authorize" ở trên cùng
3. Nhập token: `Bearer YOUR_TOKEN_HERE`
4. Click "Try it out"
5. Nhập thông tin property:
```json
{
  "title": "Nhà đẹp tại quận 1",
  "type": "HOUSE",
  "purpose": "SALE",
  "price": 5000000000,
  "area": 100,
  "bedrooms": 3,
  "bathrooms": 2,
  "province": "Hồ Chí Minh",
  "district": "Quận 1",
  "contactPhone": "0123456789"
}
```

### 5.4. Xem danh sách Bất động sản

**Qua Swagger hoặc Browser:**
- GET http://localhost:3000/api/properties
- Hoặc mở http://localhost:3001

## Troubleshooting

### Lỗi: "Cannot find module"
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "Port 3000 already in use"
```bash
# Đổi port trong backend/.env
PORT=3001
```

### Lỗi: "Prisma Client not generated"
```bash
cd backend
npm run prisma:generate
```

### Lỗi: "Database connection failed"
- Kiểm tra `DATABASE_URL` trong `backend/.env`
- Kiểm tra database đã chạy chưa (nếu dùng local)
- Kiểm tra password đúng chưa (nếu dùng Supabase)

### Lỗi: "CORS error" khi frontend gọi API
- Kiểm tra `CORS_ORIGIN` trong `backend/.env` phải là `http://localhost:3001`
- Restart backend server

### Frontend không kết nối được API
- Kiểm tra `NEXT_PUBLIC_API_URL` trong `frontend/.env.local`
- Kiểm tra backend đã chạy chưa
- Kiểm tra CORS settings

## Scripts hữu ích

### Backend
```bash
npm run start:dev      # Chạy development server
npm run build          # Build production
npm run prisma:studio  # Mở Prisma Studio (xem database)
npm run prisma:migrate # Chạy migrations
```

### Frontend
```bash
npm run dev            # Chạy development server
npm run build          # Build production
npm run start          # Chạy production server
npm run lint          # Kiểm tra code
```

## Cấu trúc khi chạy

```
Terminal 1 (Backend):
  cd backend
  npm run start:dev
  → http://localhost:3000

Terminal 2 (Frontend):
  cd frontend
  npm run dev
  → http://localhost:3001
```

## Next Steps

Sau khi chạy thành công:

1. ✅ Test các API endpoints qua Swagger
2. ✅ Tạo một vài bất động sản mẫu
3. ✅ Test tính năng tìm kiếm
4. ✅ Tùy chỉnh UI theo thiết kế
5. ✅ Thêm các tính năng bổ sung

## Lưu ý

- Backend và Frontend phải chạy **đồng thời** trong 2 terminal riêng
- Đảm bảo database đã được migrate trước khi chạy
- File `.env` và `.env.local` không được commit lên Git
- Nếu thay đổi Prisma schema, cần chạy lại `prisma:migrate`






