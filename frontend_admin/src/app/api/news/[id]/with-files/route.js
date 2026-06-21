/**
 * PATCH /api/news/[id]/with-files
 *
 * Cập nhật tin tức kèm thay ảnh đại diện.
 * - Xóa ảnh cũ trên Cloudflare R2 và bảng file_attach.
 * - Upload ảnh mới lên Cloudflare R2 và insert bản ghi file_attach mới.
 * Forward multipart/form-data xuống backend endpoint PATCH /news/:id/with-files
 */
import { NextResponse } from "next/server";
import { getBackendBaseUrl, isConnectionError } from "@/lib/api/fetchBackend";

export async function PATCH(req, { params }) {
  const { id } = params;
  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/news/${id}/with-files`;

  const authHeader = req.headers.get("Authorization");

  try {
    const formData = await req.formData();
    const fetchOptions = {
      method: "PATCH",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: formData,
    };

    // Dùng fetch gốc (không giới hạn timeout) để hỗ trợ upload file
    const res = await fetch(targetUrl, fetchOptions);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { message: "Failed to update news with files" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/news/${id}/with-files] Backend không khả dụng tại ${targetUrl}`);
      return NextResponse.json(
        { message: "Backend không khả dụng. Vui lòng thử lại sau." },
        { status: 503 }
      );
    }
    console.error(`[API/news/${id}/with-files] Lỗi không xác định:`, e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
