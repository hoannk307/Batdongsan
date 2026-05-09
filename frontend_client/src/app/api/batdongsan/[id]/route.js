/**
 * GET /api/batdongsan/[id]
 *
 * Trả về chi tiết 1 bất động sản theo ID.
 * Forward xuống backend: GET /api/properties/:id
 *
 * Response:
 *   200  { data: PropertyDetail }
 *   404  { data: null, error: string }
 */
import { NextResponse } from "next/server";
import { fetchWithTimeout, getBackendBaseUrl, isConnectionError } from "../../../../lib/api/fetchBackend";
import { mapPropertyToDetail } from "../../../../lib/api/mappers/propertyMapper";

export async function GET(_req, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ data: null, error: "Thiếu ID bất động sản." }, { status: 400 });
  }

  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/properties/${encodeURIComponent(id)}`;

  try {
    const res = await fetchWithTimeout(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);

    if (!res.ok || !payload) {
      return NextResponse.json(
        { data: null, error: "Không tìm thấy bất động sản." },
        { status: res.status || 404 }
      );
    }

    return NextResponse.json({ data: mapPropertyToDetail(payload) });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/batdongsan/${id}] Backend không khả dụng tại ${targetUrl}.`);
    } else {
      console.error(`[API/batdongsan/${id}] Lỗi không xác định:`, e);
    }
    return NextResponse.json(
      { data: null, error: "Không thể kết nối đến server." },
      { status: 503 }
    );
  }
}
