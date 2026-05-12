/**
 * GET /api/user/[id]
 *
 * Trả về thông tin chi tiết 1 user theo ID.
 * Forward xuống backend: GET /api/users/:id
 *
 * Response:
 *   200  { data: UserDetail }
 *   404  { data: null, error: string }
 */
import { NextResponse } from "next/server";
import {
  fetchWithTimeout,
  getBackendBaseUrl,
  isConnectionError,
} from "../../../../lib/api/fetchBackend";

export async function GET(_req, { params }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { data: null, error: "Thiếu ID người dùng." },
      { status: 400 }
    );
  }

  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/users/${encodeURIComponent(id)}`;

  try {
    const res = await fetchWithTimeout(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);

    if (!res.ok || !payload) {
      return NextResponse.json(
        { data: null, error: "Không tìm thấy người dùng." },
        { status: res.status || 404 }
      );
    }

    return NextResponse.json({ data: payload });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(
        `[API/user/${id}] Backend không khả dụng tại ${targetUrl}.`
      );
    } else {
      console.error(`[API/user/${id}] Lỗi không xác định:`, e);
    }
    return NextResponse.json(
      { data: null, error: "Không thể kết nối đến server." },
      { status: 503 }
    );
  }
}
