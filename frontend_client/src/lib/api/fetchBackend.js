/**
 * @file fetchBackend.js
 * Tiện ích dùng chung cho tất cả API routes trong frontend_client.
 * - Giải quyết URL backend từ biến môi trường
 * - Fetch với timeout để tránh treo request
 * - Phát hiện lỗi kết nối (ECONNREFUSED / AbortError)
 */

import { API_BASE_URL } from "@/config/env";

const FETCH_TIMEOUT_MS = 5000;

/**
 * Trả về base URL của backend NestJS.
 * Cấu hình tại: frontend_client/.env.local → NEXT_PUBLIC_API_URL
 */
export function getBackendBaseUrl() {
  return API_BASE_URL;
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
