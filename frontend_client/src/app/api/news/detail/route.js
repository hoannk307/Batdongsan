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
import { getBackendBaseUrl, isConnectionError } from "../../../../lib/api/fetchBackend";
import { mapNewsToBlogItem } from "../../../../lib/api/mappers/newsMapper";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get("id");
  const id = typeof rawId === "string" ? rawId.trim() : "";

  const backendApiBaseUrl = getBackendBaseUrl();
  //--- Chi tiết 1 bài tin ---
  if (id) {
    try {
      const targetUrl = `${backendApiBaseUrl}/news/${encodeURIComponent(id)}`;
      const res = await fetch(targetUrl, { cache: "no-store" });
      const payload = await res.json().catch(() => null);
      console.log('payload', payload);
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
}


