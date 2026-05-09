# @batdongsan/shared

Package chứa các hằng số (enum, options) dùng chung cho toàn bộ hệ thống Batdongsan:
- `frontend_client` (Next.js)
- `frontend_admin` (Next.js)
- `backend` (NestJS / TypeScript)

---

## 📁 Cấu trúc thư mục

```
shared/
├── index.js        ← Dữ liệu constants (CommonJS, chạy được mọi nơi)
├── index.d.ts      ← TypeScript declarations (cho NestJS)
├── package.json    ← Metadata package
└── README.md       ← File này
```

---

## 🛠️ Cài đặt (Development / Local)

Sử dụng **`npm link`** để liên kết package vào từng project mà không cần publish lên npm.

### Bước 1 — Đăng ký package vào npm global

```bash
cd d:/Working/Batdongsan/shared
npm link
```

### Bước 2 — Link vào từng project

```bash
# frontend_client
cd d:/Working/Batdongsan/frontend_client
npm link @batdongsan/shared

# frontend_admin
cd d:/Working/Batdongsan/frontend_admin
npm link @batdongsan/shared

# backend
cd d:/Working/Batdongsan/backend
npm link @batdongsan/shared
```

> **Lưu ý:** Sau khi `npm install` lại ở bất kỳ project nào, link có thể bị xóa.
> Bạn cần chạy lại `npm link @batdongsan/shared` ở project đó.

---

## 💻 Cách sử dụng

### Trong Next.js (frontend_client / frontend_admin)

```js
import {
  ROOMS_OPTIONS,
  BATH_OPTIONS,
  BED_OPTIONS,
  PRICE_OPTIONS,
  SQUARE_FEET_OPTIONS,
  PROPERTY_STATUS,
  PROPERTY_STATUS_OPTIONS,
} from '@batdongsan/shared';

// Dùng trong state
const [defaults] = useState({
  rooms:      ROOMS_OPTIONS,
  bath:       BATH_OPTIONS,
  bed:        BED_OPTIONS,
  price:      PRICE_OPTIONS,
  squareFeet: SQUARE_FEET_OPTIONS,
});

// Dùng PROPERTY_STATUS như enum
if (property.status === PROPERTY_STATUS.FOR_SALE) { ... }
```

### Trong NestJS (backend — TypeScript)

```ts
import {
  PRICE_OPTIONS,
  PROPERTY_STATUS,
  SelectOption,
} from '@batdongsan/shared';

// Dùng type
const options: SelectOption[] = PRICE_OPTIONS;

// Dùng enum
const status = PROPERTY_STATUS.FOR_SALE; // "FOR_SALE"
```

---

## 📦 Danh sách constants có sẵn

| Export                    | Kiểu           | Mô tả                              |
|---------------------------|----------------|------------------------------------|
| `ROOMS_OPTIONS`           | `SelectOption[]` | Số phòng: 1 → 6                  |
| `BATH_OPTIONS`            | `SelectOption[]` | Số phòng tắm: 1 → 4             |
| `BED_OPTIONS`             | `SelectOption[]` | Số phòng ngủ: 1 → 4             |
| `PRICE_OPTIONS`           | `SelectOption[]` | 14 khoảng giá (VND)              |
| `SQUARE_FEET_OPTIONS`     | `SelectOption[]` | 11 khoảng diện tích (m²)        |
| `PROPERTY_STATUS`         | `object`       | Enum trạng thái BĐS               |
| `PROPERTY_STATUS_OPTIONS` | `SelectOption[]` | Options từ `PROPERTY_STATUS`     |

**Cấu trúc `SelectOption`:**
```ts
{ id: number | string, name: string }
```

---

## 🚀 Deploy Production

`npm link` **chỉ hoạt động local**. Khi deploy production, chọn một trong hai cách sau:

---

### Cách 1 — npm Workspaces ✅ (Khuyên dùng)

Thêm cấu hình workspace vào `package.json` ở thư mục **gốc** (`d:/Working/Batdongsan/`):

**`d:/Working/Batdongsan/package.json`** (tạo mới nếu chưa có):
```json
{
  "name": "batdongsan-monorepo",
  "private": true,
  "workspaces": [
    "shared",
    "frontend_client",
    "frontend_admin",
    "backend"
  ]
}
```

Sau đó chạy **một lần duy nhất** từ thư mục gốc:
```bash
cd d:/Working/Batdongsan
npm install
```

npm workspaces sẽ tự động symlink `@batdongsan/shared` vào `node_modules` của tất cả các project. Hoạt động tốt khi deploy lên **Vercel**, **Railway**, **Docker**, v.v.

---

### Cách 2 — Relative path trong package.json

Trong `package.json` của từng project, thêm dependency trỏ thẳng vào đường dẫn tương đối:

```json
// frontend_client/package.json
{
  "dependencies": {
    "@batdongsan/shared": "file:../shared"
  }
}
```

Sau đó:
```bash
npm install
```

> Cách này hoạt động tốt khi không dùng monorepo workspace, nhưng đường dẫn phải đúng tương đối với từng project.

---

### Cách 3 — Publish lên Private Registry (cho production lớn)

Nếu team lớn hoặc CI/CD phức tạp, có thể publish lên:
- [GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Verdaccio](https://verdaccio.org/) (self-hosted private npm registry)
- npm public registry (`npm publish`)

```bash
# Publish
cd shared
npm publish --access public

# Cài đặt ở mỗi project
npm install @batdongsan/shared
```

---

## ⚠️ Lưu ý quan trọng

- Khi **thêm constant mới** vào `index.js`, cũng phải khai báo type tương ứng trong `index.d.ts`.
- Tên `id` trong `SelectOption` nên dùng **string** (không phải số) để tránh xung đột khi gửi qua API/query string.
- File này chỉ chứa **dữ liệu tĩnh** (không gọi API, không có side-effect). An toàn để import ở cả client-side và server-side.
