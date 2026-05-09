/**
 * PATCH /api/batdongsan/view
 *
 * Proxy tăng lượt xem cho 1 bất động sản.
 * Giữ URL backend ở server-side, không leak ra client.
 *
 * Request body: { id: string }
 *
 * Response:
 *   200  { success: true }
 *   400  { success: false, error: string }
 *   503  { success: false, error: string }
 */
import { NextResponse } from "next/server";
import { fetchWithTimeout, getBackendBaseUrl, isConnectionError } from "../../../../lib/api/fetchBackend";

export async function PATCH(req) {
  let id;
  try {
    const body = await req.json();
    id = body?.id;
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body không hợp lệ." },
      { status: 400 }
    );
  }

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Thiếu ID bất động sản." },
      { status: 400 }
    );
  }

  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/properties/${encodeURIComponent(id)}/view`;

  try {
    await fetchWithTimeout(targetUrl, { method: "PATCH", cache: "no-store" });
    return NextResponse.json({ success: true });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/batdongsan/view] Backend không khả dụng — bỏ qua tăng lượt xem cho id=${id}.`);
    } else {
      console.error("[API/batdongsan/view] Lỗi không xác định:", e);
    }
    // Fire-and-forget: trả 200 dù lỗi để không block UI
    return NextResponse.json({ success: false, error: "Backend không khả dụng." });
  }
}
