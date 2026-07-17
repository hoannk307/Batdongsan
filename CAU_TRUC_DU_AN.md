# CẤU TRÚC DỰ ÁN (ĐÃ CẬP NHẬT THEO CODE THỰC TẾ)

> Tài liệu này mô tả **cấu trúc và công nghệ thực tế đang chạy trong repo**, thay thế bản thiết kế ban đầu (vốn giả định NestJS + Prisma 5 + Next.js/TypeScript/Tailwind chung một `frontend/`). Thực tế dự án đã tách thành 2 frontend riêng (JavaScript, không dùng Tailwind) và mở rộng thêm module đặt phòng (`booking`). Xem thêm [CLAUDE.md](./CLAUDE.md) — bản tóm tắt ngắn dành riêng cho AI code assistant.

## 📁 Cấu trúc thư mục thực tế

```
batdongsan/                           # npm workspaces monorepo (root package.json không có scripts)
├── backend/                          # NestJS 10 + Prisma 7 (TypeScript)
│   ├── src/
│   │   ├── main.ts                   # Entry point — CORS allowlist thủ công, prefix /api, Swagger /api/docs
│   │   ├── app.module.ts             # Import toàn bộ feature module
│   │   │
│   │   ├── auth/                     # JWT (Passport) — KHÔNG có roles.guard.ts (chỉ check đăng nhập, chưa phân quyền)
│   │   │   ├── auth.controller.ts / auth.service.ts / auth.module.ts
│   │   │   ├── decorators/current-user.decorator.ts
│   │   │   ├── dto/{login,register}.dto.ts
│   │   │   ├── guards/jwt-auth.guard.ts
│   │   │   └── strategies/{jwt,local}.strategy.ts
│   │   │
│   │   ├── properties/               # Module bất động sản
│   │   │   ├── properties.controller.ts / .service.ts / .module.ts
│   │   │   ├── dto/{create,update,search,filter,search-result}-property.dto.ts
│   │   │   └── enums/property-defaults.enum.ts
│   │   │
│   │   ├── news/                     # Tin tức — hỗ trợ tags, category, upload file kèm bài
│   │   │   ├── news.controller.ts / .service.ts / .module.ts
│   │   │   └── dto/{create,update}-news.dto.ts
│   │   │
│   │   ├── booking/                  # Module đặt phòng (KHÔNG có trong thiết kế gốc) — quản lý phòng lưu trú
│   │   │   │                         # riêng cho agent: phòng, nguồn khách, booking, phụ thu, thanh toán, khóa ngày
│   │   │   ├── booking.controller.ts / .service.ts       # bookings, lock-days, payments, surcharges
│   │   │   ├── rooms.controller.ts / rooms.service.ts    # bk_rooms
│   │   │   ├── sources.controller.ts / sources.service.ts # bk_sources (nguồn đặt phòng)
│   │   │   └── dto/*.dto.ts
│   │   │
│   │   ├── locations/                # Tỉnh/Phường (2 cấp, tự tham chiếu qua parent_id)
│   │   ├── users/                    # Quản lý user, khóa/mở tài khoản (is_blocked)
│   │   ├── mail/                     # Gửi mail qua nodemailer
│   │   ├── file/                     # Upload/xem/tải file — lưu trên Cloudflare R2 (KHÔNG lưu local disk)
│   │   ├── upload/                   # Thư mục rỗng — còn sót lại từ thiết kế cũ, không dùng
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts     # Dùng driver adapter (@prisma/adapter-pg + pg.Pool), không dùng engine mặc định
│   │
│   ├── prisma/
│   │   ├── schema.prisma             # Xem chi tiết models bên dưới
│   │   ├── migrations/               # 0_init + các migration bổ sung booking/property fields/is_blocked
│   │   └── seed.ts
│   ├── prisma.config.ts              # Cấu hình Prisma 7 (thay cho datasource url trong schema.prisma)
│   └── package.json
│
├── frontend_admin/                   # Next.js 15.3.9 — "sheltos-next-admin" template, JavaScript (jsconfig.json, alias @/*)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (Auth)/authentication/       # Trang đăng nhập
│   │   │   ├── (Mainbody)/                  # Layout chính (sidebar/header)
│   │   │   │   ├── dashboard/ agents/ booking/ manage-users/ map/
│   │   │   │   │   myproperties/ news/ payments/ reports/ types/
│   │   │   └── api/                         # Route Handlers — BFF proxy sang backend NestJS
│   │   │       ├── auth/ booking/ locations/ news/ properties/
│   │   │       ├── tinymce-key/             # Trả API key TinyMCE từ server, không lộ ra client
│   │   │       └── userdata/ users/
│   │   ├── components/                      # Mirror theo từng feature area ở trên
│   │   ├── layout/{customizer,header,sidebar}/
│   │   ├── data/ config/ lib/api/ services/ utils/
│   ├── jsconfig.json                        # "@/*" → "./src/*"
│   ├── next.config.mjs                      # reactStrictMode: false; fallback env API_URL
│   └── package.json                         # dev script: next dev -p 3001
│
├── frontend_client/                  # Next.js 15.3.9 — "sheltos-next-template", JavaScript, có i18n + Redux
│   ├── src/
│   │   ├── app/
│   │   │   ├── (Mainbody)/
│   │   │   │   ├── home/ batdongsan/ (danh sách/tìm BĐS) duanbds/ dulich/
│   │   │   │   │   news/ user-profile/ authen/ pages/
│   │   │   ├── api/                         # BFF proxy — gọi INTERNAL_API_URL (backend qua Docker network)
│   │   │   │   ├── batdongsan/ client-agent/ mail/ news/ property/ user/
│   │   │   ├── i18n/                        # next-i18next: locales/, i18n-context.js, server.js, settings.js
│   │   │   └── MainProvider.js
│   │   ├── components/{agent,contact,elements,home,listing,modules,pages,property}/
│   │   ├── layout/{advancedSearch,Breadcrumb,footers,headers,loader,sidebarLayout}/
│   │   ├── lib/api/
│   │   │   ├── fetchBackend.js              # fetch có timeout + phát hiện lỗi kết nối, dùng chung cho mọi API route
│   │   │   ├── apiRequests.js
│   │   │   └── mappers/{newsMapper,propertyMapper}.js   # Chuẩn hóa response backend → props component
│   │   ├── redux-toolkit/reducers/          # State client (frontend_admin KHÔNG dùng Redux)
│   │   ├── config/ constValues/ data/ utils/
│   ├── next.config.mjs                      # images.domains cho Google avatar; reactStrictMode: false
│   └── package.json                         # dev script: next dev -p 3002
│
├── shared/                           # @batdongsan/shared — CommonJS, dùng chung cho cả 3 app
│   └── index.js                      # Hằng số: PRICE_OPTIONS, RENT_PRICE_OPTIONS, SQUARE_FEET_OPTIONS,
│                                      # ROOMS/BATH/BED_OPTIONS, PROPERTY_STATUS(_OPTIONS)
│
├── nginx/nginx.conf                  # Reverse proxy TLS: nhatranglands.vn / admin.* / api.* → 3 service tương ứng
├── docker-compose.yml                # Dev (hot-reload qua volume mount)
├── docker-compose.deploy.yml         # Production, dùng bởi CI/CD
├── .github/workflows/deploy.yml      # security-audit → build & push GHCR → deploy VPS qua SSH
├── scripts/deploy.sh
└── package.json                      # workspaces: [backend, frontend_client, frontend_admin, shared]
```

## 🧩 Kiến trúc giao tiếp Frontend ↔ Backend (khác thiết kế gốc)

Thiết kế gốc giả định frontend gọi thẳng backend bằng axios + Bearer token lưu `localStorage`. **Thực tế cả hai frontend đều dùng mô hình BFF (Backend-for-Frontend)**:

1. Component/page gọi Next.js Route Handler nội bộ (`src/app/api/.../route.js`).
2. Route Handler dùng `fetchWithTimeout()` (`lib/api/fetchBackend.js`, timeout 5s, tự phát hiện `ECONNREFUSED`/`AbortError`) để gọi backend NestJS qua `INTERNAL_API_URL` (hostname Docker nội bộ, ví dụ `http://backend:3000/api`) hoặc `NEXT_PUBLIC_API_URL` khi chạy local.
3. `mappers/` (`newsMapper.js`, `propertyMapper.js`) chuẩn hóa dữ liệu backend trả về trước khi đưa vào component.

Khi debug lỗi gọi API từ frontend, kiểm tra Route Handler tương ứng trước, không phải component — logic gọi backend nằm ở đó.

## 🗄️ Prisma Schema — models thực tế (`backend/prisma/schema.prisma`)

| Model | Ghi chú |
|---|---|
| `users` | `role` (USER/ADMIN), `is_blocked`, quan hệ tới `news`, `favorites`, `bk_*` |
| `properties` | `property_type` là string tự do (không enum), `property_status` (FOR_SALE/FOR_RENT), `status` xuất bản (DRAFT/PUBLISHED), `outstanding` (BĐS nổi bật), index theo city/area/price/type |
| `news` | `status` (DRAFT/PUBLISHED), quan hệ n-n với `tags`, `category` là số nguyên tham chiếu `news_catelog` (không có FK ràng buộc) |
| `tags`, `news_catelog` | Danh mục/tag cho tin tức |
| `locations` | Tự tham chiếu (`parent_id`) — 2 cấp: PROVINCE, WARD |
| `favorites` | User yêu thích property, unique (user_id, property_id) |
| `file_attach` | Bảng đính kèm file **kiểu polymorphic**: khóa theo `object_id` + `nghiepvu_code` (không có FK thật tới property/news) — cẩn thận khi join |
| `bk_rooms`, `bk_sources`, `bk_bookings`, `bk_surcharges`, `bk_payments`, `bk_locked_days` | Toàn bộ nghiệp vụ module **booking** (đặt phòng lưu trú riêng cho agent), không liên quan trực tiếp tới `properties` |

Enums: `LocationType`, `NewsStatus`, `PropertyStatus`, `PropertyPublishStatus`, `UserRole`, `BkBookingStatus`.

`PrismaService` dùng driver adapter (`PrismaPg` + `pg.Pool`) thay vì kết nối engine mặc định — bắt buộc với Prisma 7. Cấu hình datasource nằm ở `backend/prisma.config.ts`, không phải block `datasource` trong `schema.prisma`.

## 🔌 API Endpoints thực tế (prefix `/api`, Swagger tại `/api/docs`)

### Auth (`/auth`)
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`

### Properties (`/properties`)
- `POST /` , `POST /with-files` (multipart, upload R2 trong transaction) — cần JWT
- `GET /` (phân trang/sort), `GET /filter` (lọc theo field, **phải đứng trước `:id`**), `POST /search` (lọc nâng cao qua body)
- `GET /defaults/options`, `GET /featured`
- `GET /admin/list`, `GET /admin/:id` — cần JWT (theo owner)
- `GET /:id`, `PATCH /:id/view` (tăng view), `PATCH /:id`, `DELETE /:id`

### News (`/news`)
- `POST /`, `POST /with-files` — cần JWT
- `GET /`, `GET /latest`, `GET /categories`, `GET /category/:categoryId`, `GET /tags/:tagId`
- `GET /:id`, `GET /slug/:slug`
- `PATCH /:id`, `PATCH /:id/with-files`, `DELETE /:id`

### Locations (`/locations`)
- `GET /provinces`, `GET /wards`

### Users (`/users`)
- `GET /`, `GET /:id`, `PATCH /:id`, `PATCH /:id/block`, `DELETE /:id`

### File (`/file`)
- `POST /upload`, `GET /view/:key`, `GET /download/:key` (Cloudflare R2)

### Mail (`/mail`)
- `POST /send`

### Booking (`/booking`) — module đặt phòng
- `GET /rooms`, `GET /rooms/:id`, `POST /rooms`, `POST /rooms/with-files`, `PUT /rooms/:id`, `DELETE /rooms/:id`
- `GET /sources`, `POST /sources`, `PUT /sources/:id`, `DELETE /sources/:id`
- `GET /bookings`, `GET /bookings/calendar`, `GET /bookings/timeline`, `GET /bookings/:id`, `POST /bookings`, `PUT /bookings/:id`, `DELETE /bookings/:id`
- `POST /lock-days`, `DELETE /lock-days`
- `POST /payments`, `DELETE /payments/:id`
- `POST /surcharges`, `DELETE /surcharges/:id`

## 🛠️ Công nghệ sử dụng thực tế

### Backend
- **NestJS 10** + **TypeScript**, **Prisma 7** (`@prisma/adapter-pg`, không dùng engine mặc định) + **PostgreSQL**
- **Passport JWT** (không có roles guard — chỉ phân biệt đã đăng nhập/chưa)
- **class-validator/class-transformer** — `ValidationPipe` global bật `whitelist` + `forbidNonWhitelisted`
- **@aws-sdk/client-s3** → **Cloudflare R2** cho lưu trữ file (không lưu local, không dùng thư mục `uploads/`)
- **nodemailer** cho gửi mail
- **@nestjs/swagger** — docs tại `/api/docs`
- Test: **Jest** (unit `*.spec.ts` trong `src/`, e2e trong `test/`)

### Frontend (cả 2 app)
- **Next.js 15.3.9**, **JavaScript thuần** (không TypeScript — dùng `jsconfig.json` alias `@/*`)
- **Bootstrap 5 / reactstrap / SCSS** (KHÔNG dùng Tailwind như thiết kế gốc)
- `frontend_admin`: Formik + Yup, TinyMCE, Leaflet/react-leaflet (bản đồ), apexcharts/react-chartjs-2 (dashboard), SweetAlert2, không dùng Redux
- `frontend_client`: Redux Toolkit + react-redux, i18next/next-i18next (đa ngôn ngữ), pigeon-maps, Swiper/react-slick (carousel), photoswipe (gallery ảnh)
- Không có test suite ở cả 2 frontend — chỉ có `next lint`

### Shared
- `@batdongsan/shared`: file CommonJS (`index.js` + `index.d.ts`) chứa các hằng số dropdown (khoảng giá, diện tích, số phòng, trạng thái BĐS) dùng chung — sửa ở đây, không copy riêng từng app.

## 🚀 Scripts thực tế

### Backend
```bash
npm run start:dev       # http://localhost:3000, Swagger /api/docs
npm run build            # nest build
npm run lint              # eslint --fix
npm run test / test:watch / test:cov / test:e2e
npm run prisma:generate / prisma:migrate / prisma:studio / prisma:seed
```

### frontend_admin (port 3001) / frontend_client (port 3002)
```bash
npm run dev      # next dev -p <port> (port cố định trong script, không dùng .env)
npm run build
npm run start
npm run lint      # next lint — không có test
```

### Docker
```bash
docker compose up                              # dev: postgres + backend + 2 frontend + nginx, hot-reload qua volume
# production dùng docker-compose.deploy.yml, do CI/CD (.github/workflows/deploy.yml) điều khiển, không chạy tay
```

## 🔒 Bảo mật — lưu ý quan trọng

Production từng bị tấn công (06/2026) qua lỗ hổng RCE nghiêm trọng của Next.js 15.1.x ở cả 2 frontend. Các biện pháp đã áp dụng:
- Luôn giữ `next` ở bản vá mới nhất (hiện tại: 15.3.9) cho cả `frontend_admin` và `frontend_client`.
- CI có job `security-audit` chạy `npm audit --audit-level=critical` **trước** khi build — pipeline sẽ fail nếu có lỗ hổng critical.
- Luôn commit `package-lock.json` ở root — thiếu lockfile là nguyên nhân gốc khiến version bị trôi dẫn tới bản dính lỗ hổng.
- File lưu trên Cloudflare R2, không lưu local — biến môi trường `R2_*` bắt buộc phải cấu hình đúng, nếu thiếu thì `FileService` tự vô hiệu hóa upload/xóa thay vì lỗi khi khởi động.
