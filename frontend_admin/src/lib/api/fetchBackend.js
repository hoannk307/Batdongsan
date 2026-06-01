/**
 * @file fetchBackend.js
 * Tiện ích dùng chung cho tất cả API routes trong frontend_admin.
 * - Giải quyết URL backend từ biến môi trường
 * - Fetch với timeout để tránh treo request
 * - Phát hiện lỗi kết nối (ECONNREFUSED / AbortError)
 */

import { INTERNAL_API_URL } from "@/config/env";

const FETCH_TIMEOUT_MS = 5000;

/**
 * Trả về base URL của backend NestJS (dùng cho server-side API routes).
 * Trong Docker: http://backend:3000/api  (qua internal network)
 * Local dev:    http://localhost:3000/api
 *
 * Cấu hình tại docker-compose → INTERNAL_API_URL
 * Hoặc fallback về NEXT_PUBLIC_API_URL / localhost
 */
export function getBackendBaseUrl() {
  return INTERNAL_API_URL;
}

/**
 * Fetch với timeout tự động huỷ request sau FETCH_TIMEOUT_MS ms.
 *
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Kiểm tra lỗi có phải do không kết nối được backend không.
 *
 * @param {unknown} err
 * @returns {boolean}
 */
export function isConnectionError(err) {
  return (
    err?.cause?.code === "ECONNREFUSED" ||
    err?.name === "AbortError" ||
    err?.code === "ECONNREFUSED"
  );
}
