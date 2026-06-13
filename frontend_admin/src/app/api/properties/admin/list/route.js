import { NextResponse } from "next/server";
import { getBackendBaseUrl, fetchWithTimeout, isConnectionError } from "@/lib/api/fetchBackend";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/properties/admin/list?${searchParams.toString()}`;

  // Lấy token xác thực từ client request
  const authHeader = req.headers.get("Authorization");

  try {
    const res = await fetchWithTimeout(targetUrl, {
      method: "GET",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { message: "Failed to fetch properties admin list" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/properties/admin/list] Backend không khả dụng tại ${targetUrl}`);
      return NextResponse.json(
        { message: "Backend không khả dụng. Vui lòng thử lại sau." },
        { status: 503 }
      );
    }
    console.error("[API/properties/admin/list] Lỗi không xác định:", e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
