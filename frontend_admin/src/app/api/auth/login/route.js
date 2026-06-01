/**
 * POST /api/auth/login
 *
 * API Route proxy: nhận request login từ client,
 * forward xuống backend NestJS, rồi trả kết quả về cho client.
 *
 * Request body:
 * {
 *   email:    string
 *   password: string
 * }
 */
import { NextResponse } from "next/server";
import { fetchWithTimeout, getBackendBaseUrl, isConnectionError } from "@/lib/api/fetchBackend";

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Request body không hợp lệ. Vui lòng gửi JSON." },
      { status: 400 }
    );
  }

  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/auth/login`;

  try {
    const res = await fetchWithTimeout(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { message: "Login failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/auth/login] Backend không khả dụng tại ${targetUrl}`);
      return NextResponse.json(
        { message: "Backend không khả dụng. Vui lòng thử lại sau." },
        { status: 503 }
      );
    }
    console.error("[API/auth/login] Lỗi không xác định:", e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
