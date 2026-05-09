/**
 * GET /api/property
 *
 * Endpoint tổng quát — dùng cho các component hiển thị danh sách property
 * không cần filter nâng cao (trang chủ, sidebar, cart, favourites...).
 *
 * Query params (optional):
 *   id   → trả về chi tiết 1 property
 *   page → số trang (mặc định 1)
 */
import { NextResponse } from "next/server";
import { propertyData } from "../../../../public/API-Data/property";
import { fetchWithTimeout, getBackendBaseUrl, isConnectionError } from "../../../lib/api/fetchBackend";
import { mapPropertyToCard, mapPropertyToDetail } from "../../../lib/api/mappers/propertyMapper";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  const backendApiBaseUrl = getBackendBaseUrl();
  const isDetailRequest = Boolean(id);

  const targetUrl = isDetailRequest
    ? `${backendApiBaseUrl}/properties/${encodeURIComponent(id)}`
    : `${backendApiBaseUrl}/properties?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`;

  try {
    const res = await fetchWithTimeout(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);

    // --- Chi tiết 1 property ---
    if (isDetailRequest) {
      if (!res.ok || !payload) {
        return NextResponse.json({ data: null }, { status: res.status || 404 });
      }
      return NextResponse.json({ data: mapPropertyToDetail(payload) });
    }

    // --- Danh sách ---
    const list = payload?.data || [];
    if (!res.ok || list.length === 0) {
      return NextResponse.json({
        data: { LatestPropertyData: propertyData.LatestPropertyData || [] },
      });
    }

    return NextResponse.json({
      data: { LatestPropertyData: list.map(mapPropertyToCard) },
    });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/property] Backend không khả dụng tại ${targetUrl} — dùng dữ liệu tĩnh.`);
    } else {
      console.error("[API/property] Lỗi không xác định:", e);
    }
    return NextResponse.json({
      data: { LatestPropertyData: propertyData.LatestPropertyData || [] },
    });
  }
}
