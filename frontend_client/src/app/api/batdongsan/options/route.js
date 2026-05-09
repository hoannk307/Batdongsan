/**
 * GET /api/batdongsan/options
 *
 * Proxy lấy các tùy chọn mặc định cho form bất động sản.
 * Forward xuống backend: GET /api/properties/defaults/options
 *
 * Response:
 *   {
 *     propertyTypes:    [{ id: string, name: string }]
 *     propertyStatuses: [{ id: string, name: string }]
 *   }
 */
import { NextResponse } from "next/server";
import { fetchWithTimeout, getBackendBaseUrl, isConnectionError } from "../../../../lib/api/fetchBackend";

/** Fallback khi backend không khả dụng */
const FALLBACK_OPTIONS = {
  propertyTypes: [
    { id: "Nhà đất", name: "Nhà đất" },
    { id: "Căn hộ chung cư", name: "Căn hộ chung cư" },
    { id: "Đất nền dự án", name: "Đất nền dự án" },
    { id: "Biệt thự liền kề", name: "Biệt thự liền kề" },
  ],
  propertyStatuses: [
    { id: "FOR_SALE", name: "Đang bán" },
    { id: "FOR_RENT", name: "Cho thuê" },
  ],
};

export async function GET() {
  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/properties/defaults/options`;

  try {
    const res = await fetchWithTimeout(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);

    if (!res.ok || !payload) {
      return NextResponse.json(FALLBACK_OPTIONS);
    }

    return NextResponse.json({
      propertyTypes: payload.propertyTypes ?? FALLBACK_OPTIONS.propertyTypes,
      propertyStatuses: payload.propertyStatuses ?? FALLBACK_OPTIONS.propertyStatuses,
    });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/batdongsan/options] Backend không khả dụng — dùng dữ liệu tĩnh.`);
    } else {
      console.error("[API/batdongsan/options] Lỗi không xác định:", e);
    }
    return NextResponse.json(FALLBACK_OPTIONS);
  }
}
