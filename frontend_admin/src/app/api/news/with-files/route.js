/**
 * POST /api/news/with-files
 *
 * Tạo tin tức mới kèm file đính kèm (ảnh đại diện).
 * Forward multipart/form-data xuống backend endpoint POST /api/news/with-files
 */
import { NextResponse } from "next/server";
import { getBackendBaseUrl, isConnectionError } from "@/lib/api/fetchBackend";

export async function POST(req) {
  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/news/with-files`;

  const authHeader = req.headers.get("Authorization");

  try {
    const formData = await req.formData();
    const fetchOptions = {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: formData,
    };

    // Sử dụng fetch gốc (không giới hạn timeout 5s) để hỗ trợ upload file lớn
    const res = await fetch(targetUrl, fetchOptions);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { message: "Failed to create news with files" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/news/with-files] Backend không khả dụng tại ${targetUrl}`);
      return NextResponse.json(
        { message: "Backend không khả dụng. Vui lòng thử lại sau." },
        { status: 503 }
      );
    }
    console.error("[API/news/with-files] Lỗi không xác định:", e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
