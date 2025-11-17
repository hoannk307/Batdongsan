# PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG WEBSITE BẤT ĐỘNG SẢN

## 1. PHÂN TÍCH YÊU CẦU

### 1.1. Tổng quan hệ thống
Website bất động sản là một nền tảng cho phép:
- Người dùng đăng tin bán/cho thuê bất động sản
- Quản trị viên đăng tin tức
- Khách hàng tìm kiếm bất động sản với nhiều tiêu chí

### 1.2. Các chức năng chính

#### 1.2.1. Đăng bài bất động sản
**Yêu cầu:**
- Phân loại theo mục đích: **Bán** hoặc **Cho thuê**
- Phân loại theo loại bất động sản:
  - Nhà
  - Đất
  - Căn hộ chung cư
  - Biệt thự
  - Văn phòng
  - Bất động sản nông nghiệp
  - Bất động sản công nghiệp

**Thông tin cần thu thập:**
- Tiêu đề
- Mô tả chi tiết
- Địa chỉ (Tỉnh/Thành phố, Quận/Huyện, Phường/Xã, Đường/Số nhà)
- Giá (bán hoặc cho thuê/tháng)
- Diện tích (m²)
- Số phòng ngủ
- Số phòng tắm
- Số tầng
- Hướng nhà (Đông, Tây, Nam, Bắc, Đông Nam, Đông Bắc, Tây Nam, Tây Bắc)
- Hướng ban công (nếu có)
- Hình ảnh (nhiều ảnh)
- Thông tin liên hệ (tên, số điện thoại, email)
- Trạng thái (Đang hiển thị, Đã bán/cho thuê, Tạm ẩn)

#### 1.2.2. Quản lý tin tức
**Yêu cầu:**
- Đăng bài viết tin tức
- Phân loại tin tức (nếu cần)
- Hình ảnh đại diện
- Nội dung bài viết (HTML hoặc Markdown)
- Ngày đăng
- Lượt xem
- Trạng thái (Đã xuất bản, Nháp)

#### 1.2.3. Tìm kiếm nâng cao
**Các tiêu chí tìm kiếm:**
1. **Loại nhà đất** (dropdown/checkbox)
2. **Tỉnh thành/Quận huyện** (dropdown có phân cấp)
3. **Khoảng giá** (slider hoặc input min-max)
   - Với bán: Tổng giá (VNĐ)
   - Với cho thuê: Giá/tháng (VNĐ)
4. **Khoảng diện tích** (slider hoặc input min-max, đơn vị m²)
5. **Số phòng** (dropdown hoặc input)
6. **Hướng nhà** (checkbox nhiều lựa chọn)
7. **Hướng ban công** (checkbox nhiều lựa chọn)

**Kết quả tìm kiếm:**
- Hiển thị dạng danh sách hoặc lưới
- Phân trang
- Sắp xếp (Giá tăng dần, Giá giảm dần, Diện tích, Mới nhất)
- Lọc nhanh (Bán/Cho thuê)

---

## 2. THIẾT KẾ DATABASE

### 2.1. Sơ đồ Entity Relationship

```
┌─────────────┐
│   Users     │
│─────────────│
│ id (PK)     │
│ username    │
│ email       │
│ password    │
│ full_name   │
│ phone       │
│ role        │
│ created_at  │
└─────────────┘
      │
      │ 1:N
      │
      ▼
┌─────────────────────┐
│   Properties        │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ title               │
│ description         │
│ type (enum)         │
│ purpose (enum)      │
│ price               │
│ area                │
│ bedrooms            │
│ bathrooms           │
│ floors              │
│ house_direction     │
│ balcony_direction   │
│ province            │
│ district            │
│ ward                │
│ street              │
│ status              │
│ views               │
│ created_at          │
│ updated_at          │
└─────────────────────┘
      │
      │ 1:N
      │
      ▼
┌─────────────────────┐
│ PropertyImages      │
│─────────────────────│
│ id (PK)             │
│ property_id (FK)    │
│ image_url           │
│ is_primary          │
│ order               │
└─────────────────────┘

┌─────────────────────┐
│   News              │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ title               │
│ slug                │
│ summary             │
│ content             │
│ featured_image      │
│ category            │
│ views               │
│ status              │
│ published_at        │
│ created_at          │
│ updated_at          │
└─────────────────────┘

┌─────────────────────┐
│   Locations         │
│─────────────────────│
│ id (PK)             │
│ code                │
│ name                │
│ type (province/     │
│      district/ward) │
│ parent_id (FK)      │
│ level               │
└─────────────────────┘
```

### 2.2. Chi tiết các bảng

#### 2.2.1. Bảng `users`
| Trường | Kiểu dữ liệu | Mô tả | Ràng buộc |
|--------|--------------|-------|-----------|
| id | INT/BIGINT | ID người dùng | PK, AUTO_INCREMENT |
| username | VARCHAR(50) | Tên đăng nhập | UNIQUE, NOT NULL |
| email | VARCHAR(100) | Email | UNIQUE, NOT NULL |
| password | VARCHAR(255) | Mật khẩu (hashed) | NOT NULL |
| full_name | VARCHAR(100) | Họ và tên | |
| phone | VARCHAR(20) | Số điện thoại | |
| role | ENUM | Vai trò (user, admin) | DEFAULT 'user' |
| avatar | VARCHAR(255) | Ảnh đại diện | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | ON UPDATE CURRENT_TIMESTAMP |

#### 2.2.2. Bảng `properties`
| Trường | Kiểu dữ liệu | Mô tả | Ràng buộc |
|--------|--------------|-------|-----------|
| id | INT/BIGINT | ID bất động sản | PK, AUTO_INCREMENT |
| user_id | INT/BIGINT | ID người đăng | FK → users.id |
| title | VARCHAR(255) | Tiêu đề | NOT NULL |
| description | TEXT | Mô tả chi tiết | |
| type | ENUM | Loại BĐS | 'house', 'land', 'apartment', 'villa', 'office', 'agricultural', 'industrial' |
| purpose | ENUM | Mục đích | 'sale', 'rent' |
| price | DECIMAL(15,2) | Giá | NOT NULL |
| area | DECIMAL(10,2) | Diện tích (m²) | NOT NULL |
| bedrooms | INT | Số phòng ngủ | DEFAULT 0 |
| bathrooms | INT | Số phòng tắm | DEFAULT 0 |
| floors | INT | Số tầng | DEFAULT 1 |
| house_direction | VARCHAR(20) | Hướng nhà | 'east', 'west', 'south', 'north', 'southeast', 'northeast', 'southwest', 'northwest' |
| balcony_direction | VARCHAR(20) | Hướng ban công | (tương tự house_direction) |
| province | VARCHAR(100) | Tỉnh/Thành phố | NOT NULL |
| district | VARCHAR(100) | Quận/Huyện | NOT NULL |
| ward | VARCHAR(100) | Phường/Xã | |
| street | VARCHAR(255) | Đường/Số nhà | |
| latitude | DECIMAL(10,8) | Vĩ độ | |
| longitude | DECIMAL(11,8) | Kinh độ | |
| contact_name | VARCHAR(100) | Tên liên hệ | |
| contact_phone | VARCHAR(20) | SĐT liên hệ | NOT NULL |
| contact_email | VARCHAR(100) | Email liên hệ | |
| status | ENUM | Trạng thái | 'active', 'sold', 'rented', 'hidden' DEFAULT 'active' |
| views | INT | Lượt xem | DEFAULT 0 |
| featured | BOOLEAN | Tin nổi bật | DEFAULT FALSE |
| created_at | TIMESTAMP | Ngày đăng | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | ON UPDATE CURRENT_TIMESTAMP |

#### 2.2.3. Bảng `property_images`
| Trường | Kiểu dữ liệu | Mô tả | Ràng buộc |
|--------|--------------|-------|-----------|
| id | INT/BIGINT | ID ảnh | PK, AUTO_INCREMENT |
| property_id | INT/BIGINT | ID bất động sản | FK → properties.id, NOT NULL |
| image_url | VARCHAR(500) | URL ảnh | NOT NULL |
| is_primary | BOOLEAN | Ảnh đại diện | DEFAULT FALSE |
| order | INT | Thứ tự | DEFAULT 0 |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |

#### 2.2.4. Bảng `news`
| Trường | Kiểu dữ liệu | Mô tả | Ràng buộc |
|--------|--------------|-------|-----------|
| id | INT/BIGINT | ID tin tức | PK, AUTO_INCREMENT |
| user_id | INT/BIGINT | ID người đăng | FK → users.id |
| title | VARCHAR(255) | Tiêu đề | NOT NULL |
| slug | VARCHAR(255) | URL slug | UNIQUE, NOT NULL |
| summary | TEXT | Tóm tắt | |
| content | LONGTEXT | Nội dung | NOT NULL |
| featured_image | VARCHAR(500) | Ảnh đại diện | |
| category | VARCHAR(50) | Danh mục | |
| views | INT | Lượt xem | DEFAULT 0 |
| status | ENUM | Trạng thái | 'published', 'draft' DEFAULT 'draft' |
| published_at | TIMESTAMP | Ngày xuất bản | |
| created_at | TIMESTAMP | Ngày tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Ngày cập nhật | ON UPDATE CURRENT_TIMESTAMP |

#### 2.2.5. Bảng `locations` (Danh mục địa điểm)
| Trường | Kiểu dữ liệu | Mô tả | Ràng buộc |
|--------|--------------|-------|-----------|
| id | INT/BIGINT | ID địa điểm | PK, AUTO_INCREMENT |
| code | VARCHAR(20) | Mã địa điểm | UNIQUE |
| name | VARCHAR(100) | Tên địa điểm | NOT NULL |
| type | ENUM | Loại | 'province', 'district', 'ward' |
| parent_id | INT/BIGINT | ID cha | FK → locations.id |
| level | INT | Cấp độ | 1=province, 2=district, 3=ward |

---

## 3. THIẾT KẾ CÁC MODULE CHỨC NĂNG

### 3.1. Module Quản lý Bất động sản

#### 3.1.1. Đăng bài mới
**Luồng xử lý:**
1. Người dùng đăng nhập (hoặc đăng ký)
2. Chọn "Đăng tin mới"
3. Điền form:
   - Chọn mục đích: Bán/Cho thuê
   - Chọn loại BĐS
   - Nhập thông tin cơ bản (tiêu đề, mô tả, giá, diện tích...)
   - Chọn địa điểm (Tỉnh → Quận → Phường)
   - Nhập địa chỉ chi tiết
   - Upload hình ảnh (tối thiểu 1 ảnh, tối đa 20 ảnh)
   - Chọn ảnh đại diện
   - Nhập thông tin liên hệ
4. Xem trước
5. Gửi đăng bài
6. Hệ thống kiểm tra và lưu vào database
7. Hiển thị thông báo thành công

**Validation:**
- Tiêu đề: Bắt buộc, tối đa 255 ký tự
- Giá: Bắt buộc, > 0
- Diện tích: Bắt buộc, > 0
- Địa chỉ: Tỉnh và Quận bắt buộc
- Số điện thoại: Bắt buộc, định dạng hợp lệ
- Hình ảnh: Tối thiểu 1 ảnh, định dạng jpg/png, max 5MB/ảnh

#### 3.1.2. Chỉnh sửa bài đăng
- Chỉ chủ sở hữu hoặc admin mới được chỉnh sửa
- Có thể cập nhật tất cả thông tin
- Lưu lịch sử thay đổi (nếu cần)

#### 3.1.3. Xóa/Ẩn bài đăng
- Chủ sở hữu có thể ẩn bài đăng
- Admin có thể xóa hoặc ẩn
- Bài đã bán/cho thuê có thể đánh dấu trạng thái

### 3.2. Module Quản lý Tin tức

#### 3.2.1. Đăng tin tức
**Luồng xử lý:**
1. Admin đăng nhập
2. Vào mục "Quản lý tin tức"
3. Tạo bài viết mới:
   - Nhập tiêu đề (tự động tạo slug)
   - Nhập tóm tắt
   - Upload ảnh đại diện
   - Nhập nội dung (rich text editor)
   - Chọn danh mục
   - Chọn trạng thái (Nháp/Xuất bản)
4. Lưu và xuất bản

#### 3.2.2. Hiển thị tin tức
- Trang danh sách tin tức (phân trang)
- Trang chi tiết tin tức
- Tin tức liên quan
- Tăng lượt xem khi xem chi tiết

### 3.3. Module Tìm kiếm

#### 3.3.1. Tìm kiếm cơ bản
- Tìm kiếm theo từ khóa (tiêu đề, mô tả, địa chỉ)
- Tìm kiếm nhanh trên header

#### 3.3.2. Tìm kiếm nâng cao
**Giao diện:**
- Form tìm kiếm với các bộ lọc:
  - Radio button: Tất cả / Bán / Cho thuê
  - Dropdown: Loại BĐS (có thể chọn nhiều)
  - Dropdown phân cấp: Tỉnh → Quận (có thể chọn nhiều)
  - Slider hoặc Input: Khoảng giá (min-max)
  - Slider hoặc Input: Khoảng diện tích (min-max)
  - Dropdown: Số phòng ngủ (từ 1 đến 10+)
  - Checkbox: Hướng nhà (có thể chọn nhiều)
  - Checkbox: Hướng ban công (có thể chọn nhiều)
  - Button: "Tìm kiếm" và "Xóa bộ lọc"

**Logic tìm kiếm:**
1. Người dùng chọn các tiêu chí
2. Click "Tìm kiếm"
3. Hệ thống xây dựng query với các điều kiện:
   - `purpose IN ('sale', 'rent')` hoặc cụ thể
   - `type IN (selected_types)`
   - `province IN (selected_provinces)`
   - `district IN (selected_districts)`
   - `price BETWEEN min_price AND max_price`
   - `area BETWEEN min_area AND max_area`
   - `bedrooms >= selected_bedrooms`
   - `house_direction IN (selected_directions)`
   - `balcony_direction IN (selected_balcony_directions)`
   - `status = 'active'`
4. Sắp xếp kết quả (mặc định: Mới nhất)
5. Phân trang (20 items/page)
6. Hiển thị kết quả dạng lưới hoặc danh sách

**Tối ưu hóa:**
- Index database trên các trường tìm kiếm thường dùng
- Cache kết quả tìm kiếm phổ biến
- Lazy loading hình ảnh

#### 3.3.3. Hiển thị kết quả
- Card hiển thị:
  - Ảnh đại diện
  - Tiêu đề
  - Giá
  - Diện tích
  - Địa chỉ
  - Số phòng ngủ, phòng tắm
  - Hướng nhà
  - Ngày đăng
- Click vào card → Xem chi tiết
- Phân trang ở cuối trang

---

## 4. THIẾT KẾ API

### 4.1. API Quản lý Bất động sản

#### 4.1.1. Lấy danh sách bất động sản
```
GET /api/properties
Query params:
  - page: số trang (default: 1)
  - limit: số item/trang (default: 20)
  - purpose: 'sale' | 'rent'
  - type: loại BĐS
  - province: tỉnh
  - district: quận
  - min_price: giá tối thiểu
  - max_price: giá tối đa
  - min_area: diện tích tối thiểu
  - max_area: diện tích tối đa
  - bedrooms: số phòng ngủ
  - house_direction: hướng nhà
  - balcony_direction: hướng ban công
  - sort: 'newest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc'
Response: {
  data: Property[],
  pagination: {
    page, limit, total, totalPages
  }
}
```

#### 4.1.2. Lấy chi tiết bất động sản
```
GET /api/properties/:id
Response: Property với đầy đủ thông tin + images
```

#### 4.1.3. Tạo bất động sản mới
```
POST /api/properties
Headers: Authorization: Bearer <token>
Body: FormData {
  title, description, type, purpose, price, area,
  bedrooms, bathrooms, floors, house_direction,
  balcony_direction, province, district, ward, street,
  contact_name, contact_phone, contact_email,
  images: File[]
}
Response: { success: true, data: Property }
```

#### 4.1.4. Cập nhật bất động sản
```
PUT /api/properties/:id
Headers: Authorization: Bearer <token>
Body: (tương tự POST)
Response: { success: true, data: Property }
```

#### 4.1.5. Xóa bất động sản
```
DELETE /api/properties/:id
Headers: Authorization: Bearer <token>
Response: { success: true }
```

### 4.2. API Quản lý Tin tức

#### 4.2.1. Lấy danh sách tin tức
```
GET /api/news
Query params: page, limit, category, status
Response: { data: News[], pagination: {...} }
```

#### 4.2.2. Lấy chi tiết tin tức
```
GET /api/news/:id
Response: News
```

#### 4.2.3. Tạo tin tức mới
```
POST /api/news
Headers: Authorization: Bearer <token> (admin only)
Body: { title, summary, content, featured_image, category, status }
Response: { success: true, data: News }
```

### 4.3. API Tìm kiếm

#### 4.3.1. Tìm kiếm nâng cao
```
POST /api/properties/search
Body: {
  purpose?: 'sale' | 'rent',
  types?: string[],
  provinces?: string[],
  districts?: string[],
  min_price?: number,
  max_price?: number,
  min_area?: number,
  max_area?: number,
  bedrooms?: number,
  house_directions?: string[],
  balcony_directions?: string[],
  sort?: string,
  page?: number,
  limit?: number
}
Response: { data: Property[], pagination: {...} }
```

#### 4.3.2. Tìm kiếm nhanh
```
GET /api/properties/search?q=keyword
Response: { data: Property[] }
```

### 4.4. API Địa điểm

#### 4.4.1. Lấy danh sách tỉnh/thành
```
GET /api/locations/provinces
Response: { data: Location[] }
```

#### 4.4.2. Lấy danh sách quận/huyện theo tỉnh
```
GET /api/locations/districts?province_id=xxx
Response: { data: Location[] }
```

#### 4.4.3. Lấy danh sách phường/xã theo quận
```
GET /api/locations/wards?district_id=xxx
Response: { data: Location[] }
```

### 4.5. API Authentication

#### 4.5.1. Đăng ký
```
POST /api/auth/register
Body: { username, email, password, full_name, phone }
Response: { success: true, token, user }
```

#### 4.5.2. Đăng nhập
```
POST /api/auth/login
Body: { email/username, password }
Response: { success: true, token, user }
```

#### 4.5.3. Lấy thông tin user hiện tại
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user }
```

---

## 5. THIẾT KẾ GIAO DIỆN NGƯỜI DÙNG

### 5.1. Trang chủ
- Header: Logo, Menu, Tìm kiếm nhanh, Đăng nhập/Đăng ký
- Banner/Slider
- Tìm kiếm nổi bật (form tìm kiếm với các bộ lọc chính)
- Danh sách BĐS nổi bật (Featured)
- Danh sách BĐS mới nhất
- Danh sách BĐS xem nhiều
- Tin tức mới nhất
- Footer: Thông tin liên hệ, Links, Social media

### 5.2. Trang Danh sách Bất động sản
- Sidebar trái: Bộ lọc tìm kiếm nâng cao
- Nội dung chính:
  - Thanh sắp xếp và hiển thị (Grid/List)
  - Danh sách kết quả (Card view)
  - Phân trang
- Sidebar phải (tùy chọn): BĐS tương tự, BĐS xem nhiều

### 5.3. Trang Chi tiết Bất động sản
- Gallery hình ảnh (slider)
- Thông tin chính:
  - Tiêu đề, giá, địa chỉ
  - Thông tin chi tiết (diện tích, số phòng, hướng nhà...)
  - Mô tả
  - Bản đồ (nếu có tọa độ)
- Form liên hệ
- BĐS tương tự
- BĐS cùng khu vực

### 5.4. Trang Đăng bài
- Form đăng bài với các trường:
  - Tab 1: Thông tin cơ bản
  - Tab 2: Địa chỉ
  - Tab 3: Hình ảnh
  - Tab 4: Thông tin liên hệ
- Preview trước khi đăng
- Validation real-time

### 5.5. Trang Tin tức
- Danh sách tin tức (Grid/List)
- Phân loại tin tức
- Trang chi tiết tin tức
- Tin tức liên quan

---

## 6. CÁC TÍNH NĂNG BỔ SUNG (Tùy chọn)

### 6.1. Yêu thích
- Người dùng có thể lưu BĐS yêu thích
- Xem danh sách yêu thích

### 6.2. So sánh
- So sánh nhiều BĐS với nhau

### 6.3. Thông báo
- Thông báo khi có BĐS mới phù hợp với tiêu chí tìm kiếm
- Email notification

### 6.4. Đánh giá/Review
- Người dùng đánh giá BĐS đã mua/thuê

### 6.5. Chat/Inbox
- Liên hệ trực tiếp giữa người mua và người bán

### 6.6. Báo cáo
- Báo cáo tin đăng vi phạm

---

## 7. BẢO MẬT VÀ HIỆU NĂNG

### 7.1. Bảo mật
- Authentication & Authorization (JWT)
- Validate input (server-side và client-side)
- XSS protection
- SQL Injection prevention
- File upload validation (type, size)
- Rate limiting cho API
- CORS configuration

### 7.2. Hiệu năng
- Database indexing
- Caching (Redis) cho:
  - Kết quả tìm kiếm phổ biến
  - Danh sách địa điểm
  - Tin tức
- Image optimization (resize, compress)
- CDN cho static files
- Lazy loading images
- Pagination
- Database query optimization

### 7.3. SEO
- Friendly URLs (slug)
- Meta tags
- Sitemap
- Structured data (Schema.org)
- Open Graph tags

---

## 8. CÔNG NGHỆ SỬ DỤNG

### 8.1. Backend
- **Framework**: **NestJS** (Node.js framework với TypeScript)
- **Database**: **PostgreSQL**
- **ORM**: **Prisma** (Type-safe ORM)
- **Authentication**: JWT (Passport.js)
- **File Storage**: AWS S3, Cloudinary, hoặc local storage
- **Cache**: Redis (tùy chọn)
- **Validation**: **class-validator** (tích hợp sẵn với NestJS)
- **API Documentation**: Swagger/OpenAPI (NestJS Swagger)

### 8.2. Frontend
- **Framework**: **Next.js 14+** (React với SSR/SSG)
- **Language**: **TypeScript**
- **Styling**: **Tailwind CSS**
- **State Management**: Zustand, React Query (TanStack Query), hoặc Zustand
- **Form**: React Hook Form + Zod (validation)
- **UI Components**: Headless UI, Radix UI, hoặc tự build với Tailwind
- **Map**: Google Maps API hoặc Mapbox
- **Image Upload**: React Dropzone
- **Icons**: Heroicons, Lucide React

### 8.3. DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions, GitLab CI
- **Hosting**: 
  - Frontend: **Vercel** (tối ưu cho Next.js)
  - Backend: AWS, DigitalOcean, Railway, hoặc Render
- **Database**: PostgreSQL trên AWS RDS, Supabase, hoặc Railway
- **Monitoring**: Sentry, LogRocket
- **Environment**: Docker (tùy chọn)

### 8.4. Cấu trúc dự án
```
batdongsan/
├── backend/              # NestJS Backend
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── properties/   # Property module
│   │   ├── news/         # News module
│   │   ├── locations/    # Location module
│   │   ├── upload/       # File upload module
│   │   └── common/       # Shared modules
│   ├── prisma/           # Prisma schema & migrations
│   └── package.json
│
├── frontend/             # Next.js Frontend
│   ├── app/              # Next.js 14 App Router
│   │   ├── (auth)/       # Auth routes
│   │   ├── properties/   # Property pages
│   │   ├── news/         # News pages
│   │   └── api/          # API routes (if needed)
│   ├── components/       # React components
│   ├── lib/              # Utilities, API client
│   ├── hooks/            # Custom hooks
│   ├── types/            # TypeScript types
│   └── package.json
│
└── README.md
```

---

## 9. KẾ HOẠCH TRIỂN KHAI

### Phase 1: Core Features
1. Database setup
2. Authentication
3. CRUD Bất động sản
4. Tìm kiếm cơ bản
5. Hiển thị danh sách và chi tiết

### Phase 2: Advanced Features
1. Tìm kiếm nâng cao
2. Quản lý tin tức
3. Upload và quản lý hình ảnh
4. Phân trang và sắp xếp

### Phase 3: Enhancement
1. Tối ưu hiệu năng
2. SEO
3. Responsive design
4. Testing

### Phase 4: Additional Features
1. Yêu thích
2. Thông báo
3. Chat/Inbox
4. Analytics

---

## 10. KẾT LUẬN

Tài liệu này đã phân tích và thiết kế chi tiết hệ thống website bất động sản với các chức năng:
- ✅ Đăng bài bán/cho thuê với nhiều loại BĐS
- ✅ Quản lý tin tức
- ✅ Tìm kiếm nâng cao với nhiều tiêu chí
- ✅ Quản lý người dùng
- ✅ Quản lý hình ảnh

Hệ thống được thiết kế để có thể mở rộng và bảo trì dễ dàng. Các tính năng bổ sung có thể được thêm vào theo nhu cầu thực tế.

