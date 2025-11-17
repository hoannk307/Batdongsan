# SƠ ĐỒ LUỒNG NGHIỆP VỤ

## 1. LUỒNG ĐĂNG BÀI BẤT ĐỘNG SẢN

```
┌─────────────┐
│  Người dùng │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Đăng nhập/      │
│ Đăng ký         │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Chọn "Đăng tin" │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────┐
│ Form đăng bài:          │
│ 1. Chọn Bán/Cho thuê     │
│ 2. Chọn loại BĐS         │
│ 3. Nhập thông tin cơ bản │
│ 4. Chọn địa điểm         │
│ 5. Upload hình ảnh       │
│ 6. Thông tin liên hệ     │
└──────┬───────────────────┘
       │
       ▼
┌─────────────────┐
│ Validation      │
│ (Client-side)   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Gửi lên Server  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Validation      │
│ (Server-side)   │
└──────┬──────────┘
       │
       ├─── Lỗi ───► Hiển thị lỗi
       │
       ▼
┌─────────────────┐
│ Lưu vào DB      │
│ - Properties    │
│ - Images        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Thông báo       │
│ thành công      │
└─────────────────┘
```

## 2. LUỒNG TÌM KIẾM BẤT ĐỘNG SẢN

```
┌─────────────┐
│  Khách hàng │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Trang tìm kiếm              │
│ ┌─────────────────────────┐ │
│ │ Bộ lọc:                 │ │
│ │ - Bán/Cho thuê          │ │
│ │ - Loại BĐS              │ │
│ │ - Tỉnh/Quận             │ │
│ │ - Khoảng giá            │ │
│ │ - Khoảng diện tích      │ │
│ │ - Số phòng              │ │
│ │ - Hướng nhà             │ │
│ │ - Hướng ban công        │ │
│ └─────────────────────────┘ │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────┐
│ Click "Tìm kiếm"│
└──────┬──────────┘
       │
       ▼
┌─────────────────────────┐
│ Xây dựng Query:         │
│ - WHERE conditions      │
│ - ORDER BY              │
│ - LIMIT/OFFSET          │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────┐
│ Query Database  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Trả về kết quả  │
│ + Pagination    │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────┐
│ Hiển thị kết quả:       │
│ - Danh sách BĐS         │
│ - Phân trang            │
│ - Sắp xếp               │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────┐
│ Click vào BĐS   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Trang chi tiết  │
└─────────────────┘
```

## 3. LUỒNG QUẢN LÝ TIN TỨC

```
┌─────────────┐
│    Admin    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Đăng nhập       │
│ (Role: Admin)   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Vào "Tin tức"   │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────┐
│ Tạo bài viết mới:       │
│ - Tiêu đề               │
│ - Tóm tắt               │
│ - Nội dung (Rich text)  │
│ - Ảnh đại diện          │
│ - Danh mục              │
│ - Trạng thái            │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────┐
│ Lưu vào DB      │
└──────┬──────────┘
       │
       ├─── Nháp ───► Lưu, chưa hiển thị
       │
       ▼
┌─────────────────┐
│ Xuất bản        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Hiển thị trên   │
│ website         │
└─────────────────┘
```

## 4. LUỒNG XEM CHI TIẾT BẤT ĐỘNG SẢN

```
┌─────────────┐
│  Khách hàng │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Click vào BĐS   │
│ (từ danh sách)  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ GET /api/       │
│ properties/:id  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Query DB:       │
│ - Property info │
│ - Images        │
│ - User info     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Tăng lượt xem   │
│ (views++)       │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────┐
│ Hiển thị:               │
│ - Gallery ảnh           │
│ - Thông tin chi tiết    │
│ - Bản đồ                │
│ - Form liên hệ          │
│ - BĐS tương tự          │
└─────────────────────────┘
```

## 5. SƠ ĐỒ KIẾN TRÚC HỆ THỐNG

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   React App  │  │   React App  │  │   React App  │   │
│  │  (Homepage)  │  │  (Search)    │  │  (Detail)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/HTTPS
                        │ REST API
┌───────────────────────▼─────────────────────────────────┐
│                    API SERVER                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Express.js / NestJS                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │  │
│  │  │ Property │  │   News   │  │  Search  │       │  │
│  │  │  Routes  │  │  Routes  │  │  Routes  │       │  │
│  │  └──────────┘  └──────────┘  └──────────┘       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │  │
│  │  │   Auth   │  │  Upload  │  │ Location │       │  │
│  │  │  Routes  │  │  Routes  │  │  Routes  │       │  │
│  │  └──────────┘  └──────────┘  └──────────┘       │  │
│  └──────────────────────────────────────────────────┘  │
└───────┬──────────────┬──────────────┬──────────────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Database   │ │     Redis    │ │ File Storage │
│ (PostgreSQL/ │ │    (Cache)   │ │  (S3/Local)  │
│    MySQL)    │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

## 6. SƠ ĐỒ QUAN HỆ DATABASE

```
┌──────────────┐
│    Users     │
│──────────────│
│ id (PK)      │
│ username     │
│ email        │
│ password     │
│ role         │
└──────┬───────┘
       │ 1
       │
       │ N
       ▼
┌──────────────────┐         ┌──────────────────┐
│   Properties     │         │      News        │
│──────────────────│         │──────────────────│
│ id (PK)          │         │ id (PK)          │
│ user_id (FK)     │─────────│ user_id (FK)     │
│ title            │         │ title            │
│ type             │         │ content          │
│ purpose          │         │ status           │
│ price            │         │ published_at     │
│ area             │         └──────────────────┘
│ province         │
│ district         │
│ status           │
└──────┬───────────┘
       │ 1
       │
       │ N
       ▼
┌──────────────────┐
│ PropertyImages   │
│──────────────────│
│ id (PK)          │
│ property_id (FK) │
│ image_url        │
│ is_primary       │
└──────────────────┘

┌──────────────────┐
│   Locations      │
│──────────────────│
│ id (PK)          │
│ code             │
│ name             │
│ type             │
│ parent_id (FK)   │──┐
│ level            │  │
└──────────────────┘  │
                      │ (self-reference)
                      │
                      └───┘
```

## 7. LUỒNG XỬ LÝ TÌM KIẾM NÂNG CAO (Chi tiết)

```
User Input
    │
    ├─► purpose: 'sale' | 'rent' | 'all'
    ├─► types: ['house', 'apartment', ...]
    ├─► provinces: ['Hà Nội', 'TP.HCM', ...]
    ├─► districts: ['Quận 1', 'Quận 2', ...]
    ├─► price_range: { min: 1000000000, max: 5000000000 }
    ├─► area_range: { min: 50, max: 200 }
    ├─► bedrooms: 3
    ├─► house_directions: ['south', 'southeast']
    ├─► balcony_directions: ['south']
    └─► sort: 'newest'
         │
         ▼
Build SQL Query:
    SELECT * FROM properties
    WHERE status = 'active'
      AND (purpose = 'sale' OR purpose = 'rent')  -- if not 'all'
      AND type IN ('house', 'apartment', ...)
      AND province IN ('Hà Nội', 'TP.HCM', ...)
      AND district IN ('Quận 1', 'Quận 2', ...)
      AND price BETWEEN 1000000000 AND 5000000000
      AND area BETWEEN 50 AND 200
      AND bedrooms >= 3
      AND house_direction IN ('south', 'southeast')
      AND balcony_direction IN ('south')
    ORDER BY created_at DESC  -- based on sort param
    LIMIT 20 OFFSET 0
         │
         ▼
Execute Query
         │
         ▼
Join with Images:
    SELECT p.*, pi.image_url, pi.is_primary
    FROM properties p
    LEFT JOIN property_images pi ON p.id = pi.property_id
    WHERE ...
         │
         ▼
Format Results:
    {
      data: [
        {
          id, title, price, area, address,
          images: [{ url, is_primary }],
          ...
        },
        ...
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 150,
        totalPages: 8
      }
    }
         │
         ▼
Return to Client
```

## 8. LUỒNG UPLOAD HÌNH ẢNH

```
User selects images
    │
    ▼
Client-side validation:
    - File type: jpg, png, webp
    - File size: < 5MB each
    - Max count: 20
    │
    ▼
FormData.append('images', file1, file2, ...)
    │
    ▼
POST /api/properties/:id/images
    │
    ▼
Server validation:
    - Check file type
    - Check file size
    - Check user permission
    │
    ▼
Process images:
    - Generate unique filename
    - Resize (if needed)
    - Compress
    - Upload to storage (S3/Local)
    │
    ▼
Save to database:
    INSERT INTO property_images
    (property_id, image_url, is_primary, order)
    VALUES (...)
    │
    ▼
Return success response
```

