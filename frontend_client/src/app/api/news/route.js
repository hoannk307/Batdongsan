/**
 * GET /api/news
 *
 * Endpoint tin tức:
 *  - Có ?id=xxx  → trả về chi tiết 1 bài tin (BlogItem)
 *  - Không có id → trả về danh sách tin PUBLISHED (phân trang)
 *
 * Query params:
 *   id    → ID bài tin
 *   page  → số trang (mặc định 1, tối đa 9999)
 *   limit → số lượng mỗi trang (mặc định 6, tối đa 30)
 */
import { NextResponse } from "next/server";
import { getBackendBaseUrl, isConnectionError } from "../../../lib/api/fetchBackend";
import { mapNewsToBlogItem } from "../../../lib/api/mappers/newsMapper";

function parsePositiveInt(value, { defaultValue, min = 1, max = 50 } = {}) {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(n)) return defaultValue;
  return Math.min(max, Math.max(min, n));
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get("id");
  const id = typeof rawId === "string" ? rawId.trim() : "";

  const backendApiBaseUrl = getBackendBaseUrl();

  // --- Chi tiết 1 bài tin ---
  if (id) {
    try {
      const targetUrl = `${backendApiBaseUrl}/news/${encodeURIComponent(id)}`;
      const res = await fetch(targetUrl, { cache: "no-store" });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload) return NextResponse.json(null, { status: res.status || 500 });
      if (payload?.status && payload.status !== "PUBLISHED") {
        return NextResponse.json(null, { status: 404 });
      }
      return NextResponse.json(mapNewsToBlogItem(payload));
    } catch (e) {
      if (isConnectionError(e)) {
        console.warn("[API/news] Backend không khả dụng khi lấy chi tiết tin.");
      } else {
        console.error("[API/news] Lỗi khi lấy chi tiết tin:", e);
      }
      return NextResponse.json(null, { status: 500 });
    }
  }

  // --- Danh sách tin ---
  const page = parsePositiveInt(searchParams.get("page"), { defaultValue: 1, min: 1, max: 9999 });
  const limit = parsePositiveInt(searchParams.get("limit"), { defaultValue: 6, min: 1, max: 30 });

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status: "PUBLISHED",
  }).toString();
  const targetUrl = `${backendApiBaseUrl}/news?${query}`;

  try {
    const res = await fetch(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);
    const list = payload?.data;

    if (!res.ok || !Array.isArray(list)) return NextResponse.json([]);
    return NextResponse.json(list.map(mapNewsToBlogItem));
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn("[API/news] Backend không khả dụng khi lấy danh sách tin.");
    } else {
      console.error("[API/news] Lỗi khi lấy danh sách tin:", e);
    }
    return NextResponse.json([]);
  }
}
