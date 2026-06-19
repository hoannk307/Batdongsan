import { NextResponse } from "next/server";
import { getBackendBaseUrl, isConnectionError, fetchWithTimeout } from "@/lib/api/fetchBackend";

export async function GET(req, { params }) {
  const { id } = params;
  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/users/${id}`;

  try {
    const res = await fetchWithTimeout(targetUrl, { method: "GET" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(data || { message: "Failed to fetch user" }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      return NextResponse.json({ message: "Backend không khả dụng." }, { status: 503 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const { id } = params;
  const backendApiBaseUrl = getBackendBaseUrl();
  const authHeader = req.headers.get("Authorization");

  // Handle /block sub-path via URL check
  const url = new URL(req.url);
  const isBlock = url.pathname.endsWith("/block");
  const targetUrl = isBlock
    ? `${backendApiBaseUrl}/users/${id}/block`
    : `${backendApiBaseUrl}/users/${id}`;

  try {
    const body = isBlock ? undefined : await req.json().catch(() => ({}));
    const res = await fetchWithTimeout(targetUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(data || { message: "Failed to update user" }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      return NextResponse.json({ message: "Backend không khả dụng." }, { status: 503 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/users/${id}`;
  const authHeader = req.headers.get("Authorization");

  try {
    const res = await fetchWithTimeout(targetUrl, {
      method: "DELETE",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(data || { message: "Failed to delete user" }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      return NextResponse.json({ message: "Backend không khả dụng." }, { status: 503 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
