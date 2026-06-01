import { NextResponse } from "next/server";
import { fetchWithTimeout, getBackendBaseUrl, isConnectionError } from "@/lib/api/fetchBackend";
import { propertyData } from "../../../../public/API-Data/property";

export async function GET(req) {
  return NextResponse.json(propertyData);
}

// export async function GET(req) {
//   // Redirect từ /api/property (singular) sang /api/properties (plural) để đồng nhất
//   const { searchParams } = new URL(req.url);
//   const queryString = searchParams.toString();
//   return NextResponse.redirect(
//     new URL(`/api/properties${queryString ? `?${queryString}` : ""}`, req.url)
//   );
// }

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
  const targetUrl = `${backendApiBaseUrl}/properties`;

  // Nhận Authorization header để chuyển tiếp xuống backend
  const authHeader = req.headers.get("Authorization");

  try {
    const res = await fetchWithTimeout(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { message: "Failed to create property" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn(`[API/properties] Backend không khả dụng tại ${targetUrl}`);
      return NextResponse.json(
        { message: "Backend không khả dụng. Vui lòng thử lại sau." },
        { status: 503 }
      );
    }
    console.error("[API/properties] Lỗi không xác định:", e);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
