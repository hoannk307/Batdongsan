/**
 * POST /api/batdongsan/search
 *
 * Tìm kiếm bất động sản nâng cao bằng POST body (JSON).
 * Forward xuống backend: POST /api/properties/search
 *
 * Request body (tất cả optional, camelCase theo SearchPropertyDto):
 * {
 *   page?          : number
 *   limit?         : number
 *   propertyStatus?: string          - "FOR_SALE" | "FOR_RENT"
 *   propertyTypes? : string[]
 *   cities?        : string[]
 *   wards?         : string[]
 *   minPrice?      : number
 *   maxPrice?      : number
 *   minArea?       : number
 *   maxArea?       : number
 *   minBeds?       : number
 *   minBaths?      : number
 *   sort?          : string          - "newest" | "price_asc" | "price_desc" | ...
 * }
 */
import { NextResponse } from "next/server";
import { propertyData } from "../../../../../public/API-Data/property";
import { fetchWithTimeout, getBackendBaseUrl, isConnectionError } from "../../../../lib/api/fetchBackend";
import { mapPropertyToCard, applyStaticFilters } from "../../../../lib/api/mappers/propertyMapper";

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Request body không hợp lệ. Vui lòng gửi JSON." },
      { status: 400 }
    );
  }

  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/properties/search`;

  try {
    const res = await fetchWithTimeout(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = await res.json().catch(() => null);
    const items = payload?.data || [];

    if (!res.ok || items.length === 0) {
      const staticData = applyStaticFilters(propertyData.LatestPropertyData || [], body);
      return NextResponse.json({
        data: {
          LatestPropertyData: staticData,
          pagination: { page: body.page ?? 1, limit: body.limit ?? 20, total: staticData.length },
        },
      });
    }

    return NextResponse.json({
      data: {
        LatestPropertyData: items.map(mapPropertyToCard),
        pagination: payload?.pagination ?? {
          page: body.page ?? 1,
          limit: body.limit ?? 20,
          total: items.length,
        },
      },
    });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/batdongsan/search] Backend không khả dụng tại ${targetUrl} — dùng dữ liệu tĩnh.`);
    } else {
      console.error("[API/batdongsan/search] Lỗi không xác định:", e);
    }
    const staticData = applyStaticFilters(propertyData.LatestPropertyData || [], body);
    return NextResponse.json({
      data: {
        LatestPropertyData: staticData,
        pagination: { page: body.page ?? 1, limit: body.limit ?? 20, total: staticData.length },
      },
    });
  }
}
