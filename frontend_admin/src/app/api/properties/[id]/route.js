import { NextResponse } from "next/server";
import { getBackendBaseUrl, fetchWithTimeout, isConnectionError } from "@/lib/api/fetchBackend";

export async function GET(req, { params }) {
  const { id } = await params;
  const targetUrl = `${getBackendBaseUrl()}/properties/${id}`;
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
      return NextResponse.json(data || { message: "Error fetching property" }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const targetUrl = `${getBackendBaseUrl()}/properties/${id}`;
  const authHeader = req.headers.get("Authorization");
  
  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  try {
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
      return NextResponse.json(data || { message: "Error updating property" }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  const targetUrl = `${getBackendBaseUrl()}/properties/${id}`;
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
      return NextResponse.json(data || { message: "Error deleting property" }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (isConnectionError(e)) {
      return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
