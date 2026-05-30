/**
 * @file env.js
 * File cấu hình trung tâm cho frontend_client.
 *
 * ĐỂ THAY ĐỔI ĐỊA CHỈ SERVER: chỉ cần cập nhật các biến trong
 * file frontend_client/.env.local
 *
 * Ví dụ:
 *   NEXT_PUBLIC_API_URL=https://api.nhatranglands.vn      ← production
 *   NEXT_PUBLIC_API_URL=http://localhost:3000/api          ← local dev
 *   NEXT_PUBLIC_SITE_URL=https://nhatranglands.vn          ← production
 *   NEXT_PUBLIC_SITE_URL=http://localhost:3002              ← local dev
 */

/** Base URL của backend NestJS API (dùng cho client-side, browser gọi) */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * URL nội bộ của backend (dùng cho server-side API routes bên trong Docker).
 * Trong Docker, các API route chạy server-side cần gọi backend qua internal
 * Docker network (http://backend:3000/api) thay vì đi qua public URL.
 *
 * Nếu không set INTERNAL_API_URL, sẽ fallback về NEXT_PUBLIC_API_URL.
 */
export const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL || API_BASE_URL;

/** URL công khai của frontend_client (dùng cho SEO, OG tags) */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";

/** Base URL công khai của Cloudflare R2 (dùng để ghép với path ảnh từ file_attach) */
export const R2_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL || "https://image.nhatranglands.vn";

/** URL của frontend_admin (dùng cho link "Đăng bài") */
export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
