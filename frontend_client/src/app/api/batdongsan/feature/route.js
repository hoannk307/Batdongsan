/**
 * GET /api/batdongsan/feature
 *
 * Danh sách BĐS nổi bật (outstanding = true), sắp xếp theo created_at mới nhất.
 * Forward query params xuống backend endpoint /api/properties/featured
 *
 * Query params (tất cả optional):
 *   page, limit
 *
 * Response:
 *   { data: PropertyCard[], pagination: { page, limit, total, totalPages } }
 */
import { NextResponse } from "next/server";
import { fetchWithTimeout, getBackendBaseUrl, isConnectionError } from "../../../../lib/api/fetchBackend";
import { mapPropertyToCard } from "../../../../lib/api/mappers/propertyMapper";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/properties/featured?page=${page}&limit=${limit}`;

  try {
    const res = await fetchWithTimeout(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);

    if (!res.ok || !payload) {
      return NextResponse.json(
        { data: [], pagination: { page, limit, total: 0, totalPages: 0 } },
        { status: res.status || 500 }
      );
    }

    const list = payload?.data || [];
    return NextResponse.json({
      data: list.map(mapPropertyToCard),
      pagination: payload?.pagination ?? { page, limit, total: list.length, totalPages: 1 },
    });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/batdongsan/feature] Backend không khả dụng tại ${targetUrl}`);
    } else {
      console.error("[API/batdongsan/feature] Lỗi không xác định:", e);
    }
    return NextResponse.json({
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    });
  }
}
