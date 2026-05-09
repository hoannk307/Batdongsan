/**
 * GET /api/batdongsan/list
 *
 * Danh sách bất động sản có hỗ trợ filter và phân trang.
 * Forward query params xuống backend endpoint /api/properties/filter
 *
 * Query params (tất cả optional):
 *   page, limit, property_status, property_type, beds, baths,
 *   area_min, area_max, price_min, price_max, any_city, any_ward,
 *   landmark, sort
 *
 * Response:
 *   { data: PropertyCard[], pagination: { page, limit, total } }
 */
import { NextResponse } from "next/server";
import { propertyData } from "../../../../../public/API-Data/property";
import { fetchWithTimeout, getBackendBaseUrl, isConnectionError } from "../../../../lib/api/fetchBackend";
import { mapPropertyToCard, applyStaticFilters } from "../../../../lib/api/mappers/propertyMapper";

const FILTER_PARAMS = [
  "property_status", "property_type",
  "beds", "baths",
  "area_min", "area_max",
  "price_min", "price_max",
  "any_city", "any_ward", "landmark", "sort",
];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const backendApiBaseUrl = getBackendBaseUrl();

  // Tập hợp filters cho fallback static data
  const filters = Object.fromEntries(
    FILTER_PARAMS.map((key) => [key, searchParams.get(key) || null]).filter(([, v]) => v !== null)
  );

  const filterQuery = new URLSearchParams({ page, limit });
  FILTER_PARAMS.forEach((key) => {
    const val = searchParams.get(key);
    if (val !== null && val !== "") filterQuery.set(key, val);
  });
  const targetUrl = `${backendApiBaseUrl}/properties/filter?${filterQuery.toString()}`;

  try {
    const res = await fetchWithTimeout(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);

    // Backend lỗi → fallback static data với filter
    if (!res.ok || !payload) {
      const staticData = applyStaticFilters(propertyData.LatestPropertyData || [], filters);
      return NextResponse.json({
        data: staticData,
        pagination: { page, limit, total: staticData.length },
      });
    }

    // Backend OK → kết quả có thể rỗng (filter không có kết quả là hợp lệ)
    const list = payload?.data || [];
    return NextResponse.json({
      data: list.map(mapPropertyToCard),
      pagination: payload?.pagination ?? { page, limit, total: list.length },
    });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/batdongsan/list] Backend không khả dụng tại ${targetUrl} — dùng dữ liệu tĩnh.`);
    } else {
      console.error("[API/batdongsan/list] Lỗi không xác định:", e);
    }
    const staticData = applyStaticFilters(propertyData.LatestPropertyData || [], filters);
    return NextResponse.json({
      data: staticData,
      pagination: { page, limit, total: staticData.length },
    });
  }
}
