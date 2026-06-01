import { NextResponse } from "next/server";
import { getBackendBaseUrl, isConnectionError } from "@/lib/api/fetchBackend";

export async function POST(req) {
  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/properties/with-files`;

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

    // Sử dụng fetch gốc (không giới hạn timeout 5s) để hỗ trợ truyền stream upload tệp dung lượng lớn ổn định
    const res = await fetch(targetUrl, fetchOptions);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { message: "Failed to create property with files" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/properties/with-files] Backend không khả dụng tại ${targetUrl}`);
      return NextResponse.json(
        { message: "Backend không khả dụng. Vui lòng thử lại sau." },
        { status: 503 }
      );
    }
    console.error("[API/properties/with-files] Lỗi không xác định:", e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
