/**
 * @file env.js
 * File cấu hình trung tâm cho frontend_client.
 *
 * ĐỂ THAY ĐỔI ĐỊA CHỈ SERVER: chỉ cần cập nhật các biến trong
 * file frontend_client/.env.local
 *
 * Ví dụ:
 *   NEXT_PUBLIC_API_URL=http://103.176.179.151:3001/api   ← production
 *   NEXT_PUBLIC_API_URL=http://localhost:3000/api          ← local dev
 *   NEXT_PUBLIC_SITE_URL=http://103.176.179.151:3002       ← production
 *   NEXT_PUBLIC_SITE_URL=http://localhost:3002             ← local dev
 */

/** Base URL của backend NestJS API */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/** URL công khai của frontend_client (dùng cho SEO, OG tags) */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";

/** URL của frontend_admin (dùng cho link "Đăng bài") */
export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";
