/**
 * GET /api/batdongsan
 *
 * Danh sách bất động sản mới nhất cho trang chủ (phân trang đơn giản).
 * Để lấy chi tiết 1 property, dùng GET /api/batdongsan/[id]
 *
 * Query params:
 *   page?  : number (default 1)
 *   limit? : number (default 10)
 */
import { NextResponse } from "next/server";
import { propertyData } from "../../../../public/API-Data/property";
import { fetchWithTimeout, getBackendBaseUrl, isConnectionError } from "../../../lib/api/fetchBackend";
import { mapPropertyToCard } from "../../../lib/api/mappers/propertyMapper";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/properties?page=${page}&limit=${limit}`;

  try {
    const res = await fetchWithTimeout(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);

    // Backend lỗi → fallback static data
    if (!res.ok || !payload) {
      const staticList = propertyData.LatestPropertyData || [];
      return NextResponse.json({
        data: staticList.map(mapPropertyToCard),
        pagination: { page, limit, total: staticList.length },
      });
    }

    const list = payload?.data || [];
    return NextResponse.json({
      data: list.map(mapPropertyToCard),
      pagination: payload?.pagination ?? { page, limit, total: list.length },
    });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/batdongsan] Backend không khả dụng tại ${targetUrl} — dùng dữ liệu tĩnh.`);
    } else {
      console.error("[API/batdongsan] Lỗi không xác định:", e);
    }
    const staticList = propertyData.LatestPropertyData || [];
    return NextResponse.json({
      data: staticList.map(mapPropertyToCard),
      pagination: { page, limit, total: staticList.length },
    });
  }
}
