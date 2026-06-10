import { NextResponse } from "next/server";
import { getBackendBaseUrl, isConnectionError, fetchWithTimeout } from "@/lib/api/fetchBackend";

export async function PUT(req, { params }) {
  const { id } = await params;
  const backendApiBaseUrl = getBackendBaseUrl();
  const authHeader = req.headers.get("Authorization");
  const targetUrl = `${backendApiBaseUrl}/booking/bookings/${id}`;

  try {
    const body = await req.json();
    const res = await fetchWithTimeout(targetUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return NextResponse.json(data || { message: "Failed" }, { status: res.status });
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) return NextResponse.json({ message: "Backend không khả dụng." }, { status: 503 });
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const backendApiBaseUrl = getBackendBaseUrl();
  const authHeader = req.headers.get("Authorization");
  const targetUrl = `${backendApiBaseUrl}/booking/bookings/${id}`;

  try {
    const res = await fetchWithTimeout(targetUrl, {
      method: "DELETE",
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
