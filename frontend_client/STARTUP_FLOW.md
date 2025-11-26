# Luồng khởi chạy Frontend Client

## 📋 Entry Point chính

### 1. **package.json** - Scripts khởi chạy
```json
"scripts": {
  "dev": "next dev",        // Development mode
  "build": "next build",    // Build production
  "start": "next start"     // Production mode
}
```

### 2. **next.config.mjs** - Cấu hình Next.js
- Cấu hình images domains
- Environment variables (API_URL)
- React Strict Mode settings

### 3. **src/middleware.js** - Middleware (chạy đầu tiên)
- Xử lý redirect "/" → "/home/search-tab"
- Chạy trước mọi request

### 4. **src/app/layout.js** - Root Layout (Entry Point chính) ⭐
**Đây là file quan trọng nhất - Entry Point của ứng dụng**

- Setup I18n (Internationalization)
- Import global styles (SCSS, CSS)
- Setup HTML head (fonts, icons, meta tags)
- Wrap toàn bộ app với MainProvider

### 5. **src/app/MainProvider.js** - Redux Provider
- Wrap app với Redux Store Provider
- Cung cấp state management cho toàn app

### 6. **src/app/(Mainbody)/layout.js** - Layout cho trang chính
- Setup theme colors (CSS variables)
- ToastContainer cho notifications
- Customizer component
- TapToTop component

### 7. **src/app/(Mainbody)/home/search-tab/page.js** - Trang mặc định
- Trang home mặc định khi vào "/"
- Bao gồm: NavbarFour, BodyContent, FooterFour

---

## 🚀 Cách khởi chạy

```bash
cd frontend_client
npm install    # Cài đặt dependencies (nếu chưa có)
npm run dev    # Chạy development server
```

Server sẽ chạy tại: `http://localhost:3000`

---

## 📁 Cấu trúc thư mục quan trọng

```
frontend_client/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.js          # ⭐ ROOT LAYOUT (Entry Point)
│   │   ├── MainProvider.js    # Redux Provider
│   │   └── (Mainbody)/        # Nhóm các trang chính
│   │       ├── layout.js      # Layout cho Mainbody
│   │       └── home/search-tab/page.js  # Trang mặc định
│   ├── middleware.js          # Middleware (chạy đầu tiên)
│   ├── components/            # React components
│   ├── layout/                # Layout components (Header, Footer)
│   └── redux-toolkit/         # Redux store & reducers
├── next.config.mjs            # Next.js config
└── package.json               # Dependencies & scripts
```

---

## ⚠️ Lưu ý

1. **Entry Point chính**: `src/app/layout.js` - Đây là nơi bắt đầu của mọi request
2. **Middleware**: `src/middleware.js` chạy trước layout.js
3. **Routing**: Next.js 15 sử dụng App Router, routes dựa trên cấu trúc thư mục
4. **State Management**: Redux được setup trong MainProvider.js
5. **Internationalization**: I18n được setup trong layout.js

---

## ❓ Làm sao Next.js biết phải load layout.js?

### 🎯 Next.js sử dụng **File System Routing** (Convention over Configuration)

**KHÔNG CẦN** file cấu hình nào gọi đến `layout.js`. Next.js tự động làm điều này!

#### Cách hoạt động:

1. **Khi bạn chạy `npm run dev`:**
   - Next.js khởi động server
   - Next.js **tự động scan** thư mục `src/app/` (hoặc `app/`)
   - Nó tìm các file **đặc biệt** với tên cụ thể theo **convention**

2. **Các file đặc biệt Next.js tự động phát hiện:**

   | Tên file | Vai trò | Vị trí |
   |----------|---------|--------|
   | `layout.js` | Root Layout (bọc toàn bộ app) | `src/app/layout.js` |
   | `page.js` | Trang hiển thị | `src/app/**/page.js` |
   | `loading.js` | Loading UI | `src/app/**/loading.js` |
   | `error.js` | Error UI | `src/app/**/error.js` |
   | `not-found.js` | 404 page | `src/app/not-found.js` |
   | `middleware.js` | Middleware | `src/middleware.js` (root) |

3. **Luồng tự động:**
   ```
   npm run dev
   ↓
   Next.js scan src/app/
   ↓
   Tìm thấy src/app/layout.js → Tự động load làm Root Layout
   ↓
   Tìm thấy src/app/**/page.js → Tạo routes
   ↓
   Tìm thấy src/middleware.js → Chạy middleware trước mọi request
   ```

4. **Đây là "magic" của Next.js Framework:**
   - ❌ **KHÔNG CẦN** cấu hình như React Router (`<Routes>`, `<Route>`)
   - ❌ **KHÔNG CẦN** import `layout.js` vào đâu cả
   - ✅ Chỉ cần đặt file đúng tên và vị trí → Next.js tự động làm việc còn lại!

#### Ví dụ cấu trúc:

```
src/app/
├── layout.js          ← Next.js TỰ ĐỘNG phát hiện và load
├── page.js            ← Route "/" (nếu có)
├── MainProvider.js    ← File thường, cần import vào layout.js
└── (Mainbody)/
    ├── layout.js      ← Next.js TỰ ĐỘNG phát hiện làm nested layout
    └── home/
        └── search-tab/
            └── page.js  ← Route "/home/search-tab"
```

#### Tóm lại:

**Entry point thực sự**: Next.js Framework tự thân (khi chạy `npm run dev`)
- Framework tự động tìm và load `src/app/layout.js` 
- Không cần file cấu hình nào cả - đây là **convention** của Next.js App Router

