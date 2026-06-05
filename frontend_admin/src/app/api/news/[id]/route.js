import { NextResponse } from "next/server";
import { getBackendBaseUrl, isConnectionError, fetchWithTimeout } from "@/lib/api/fetchBackend";

export async function GET(req, { params }) {
  const { id } = params;
  const backendApiBaseUrl = getBackendBaseUrl();
  const targetUrl = `${backendApiBaseUrl}/news/${id}`;

  try {
    const res = await fetchWithTimeout(targetUrl, {
      method: "GET",
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(data || { message: "Failed to fetch news" }, { status: res.status });
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
  const targetUrl = `${backendApiBaseUrl}/news/${id}`;
  const authHeader = req.headers.get("Authorization");

  try {
    const body = await req.json();
    const res = await fetchWithTimeout(targetUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(data || { message: "Failed to update news" }, { status: res.status });
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
  const targetUrl = `${backendApiBaseUrl}/news/${id}`;
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
      return NextResponse.json(data || { message: "Failed to delete news" }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      return NextResponse.json({ message: "Backend không khả dụng." }, { status: 503 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
