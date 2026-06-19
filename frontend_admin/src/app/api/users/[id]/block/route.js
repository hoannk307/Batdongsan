import { NextResponse } from "next/server";
import { getBackendBaseUrl, isConnectionError, fetchWithTimeout } from "@/lib/api/fetchBackend";

export async function PATCH(req, { params }) {
  const { id } = params;
  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/users/${id}/block`;
  const authHeader = req.headers.get("Authorization");

  try {
    const res = await fetchWithTimeout(targetUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(data || { message: "Failed to toggle block user" }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      return NextResponse.json({ message: "Backend không khả dụng." }, { status: 503 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
