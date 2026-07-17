import { NextResponse } from "next/server";
import { getBackendBaseUrl, isConnectionError, fetchWithTimeout } from "@/lib/api/fetchBackend";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const backendApiBaseUrl = getBackendBaseUrl();
  const authHeader = req.headers.get("Authorization");
  const targetUrl = `${backendApiBaseUrl}/booking/revenue/yearly?${searchParams.toString()}`;

  try {
    const res = await fetchWithTimeout(targetUrl, {
      method: "GET",
      headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return NextResponse.json(data || { message: "Failed" }, { status: res.status });
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) return NextResponse.json({ message: "Backend không khả dụng." }, { status: 503 });
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
