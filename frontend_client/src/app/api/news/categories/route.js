import { NextResponse } from "next/server";
import { getBackendBaseUrl, fetchWithTimeout, isConnectionError } from "@/lib/api/fetchBackend";

export async function GET() {
  const targetUrl = `${getBackendBaseUrl()}/news/categories`;
  try {
    const res = await fetchWithTimeout(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);
    if (!res.ok) return NextResponse.json([], { status: res.status });
    return NextResponse.json(payload);
  } catch (e) {
    if (isConnectionError(e)) {
      console.warn("[API/news/categories] Backend không khả dụng.");
    }
    return NextResponse.json([]);
  }
}
