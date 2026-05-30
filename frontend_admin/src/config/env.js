/**
 * @file env.js
 * File cấu hình trung tâm cho frontend_admin.
 *
 * TẤT CẢ biến môi trường được đọc TẬP TRUNG tại đây.
 * Các file khác chỉ import hằng số từ file này, KHÔNG dùng process.env trực tiếp.
 *
 * ĐỂ THAY ĐỔI ĐỊA CHỈ SERVER: cập nhật biến trong file frontend_admin/.env.local
 *
 * Ví dụ:
 *   NEXT_PUBLIC_API_URL=https://api.nhatranglands.vn      ← production
 *   NEXT_PUBLIC_API_URL=http://localhost:3000/api          ← local dev
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

/** TinyMCE API key (dùng cho trình soạn thảo tin tức) */
export const TINYMCE_API_KEY =
  process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "";

/** TinyMCE script src (tùy chỉnh CDN, nếu không set sẽ dùng CDN mặc định) */
export const TINYMCE_SCRIPT_SRC =
  process.env.NEXT_PUBLIC_TINYMCE_SCRIPT_SRC || "";

/** Dev access token (chỉ dùng khi dev, bypass login) */
export const DEV_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN || process.env.DEV_ACCESS_TOKEN || "";
