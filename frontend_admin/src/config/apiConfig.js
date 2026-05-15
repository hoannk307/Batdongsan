/**
 * @file apiConfig.js
 * File cấu hình trung tâm cho frontend_admin.
 *
 * ĐỂ THAY ĐỔI ĐỊA CHỈ SERVER: chỉ cần cập nhật biến NEXT_PUBLIC_API_URL
 * trong file frontend_admin/.env.local
 *
 * Ví dụ:
 *   NEXT_PUBLIC_API_URL=http://103.176.179.151:3001/api   ← production
 *   NEXT_PUBLIC_API_URL=http://localhost:3000/api          ← local dev
 */

/** Base URL của backend NestJS API */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
