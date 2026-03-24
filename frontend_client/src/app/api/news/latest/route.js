import { NextResponse } from "next/server";

const FALLBACK_BACKEND_API_URL = "http://localhost:3000/api";
const FALLBACK_IMAGE = "/assets/images/property/11.jpg";

function toBlogItem(newsItem) {
  const createdAt = newsItem?.created_at ? new Date(newsItem.created_at) : null;

  return {
    id: String(newsItem?.id ?? ""),
    img: newsItem?.featured_image || FALLBACK_IMAGE,
    date: createdAt ? String(createdAt.getDate()).padStart(2, "0") : "",
    month: createdAt
      ? createdAt.toLocaleString("en-US", { month: "short" }).toUpperCase()
      : "",
    place: newsItem?.category || "News",
    title: newsItem?.title || "Untitled",
    detail: newsItem?.summary || "",
    slug: newsItem?.slug || "",
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "6";

  const backendApiBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.BACKEND_API_URL ||
    FALLBACK_BACKEND_API_URL;

  const targetUrl = `${backendApiBaseUrl}/news?page=${encodeURIComponent(
    page
  )}&limit=${encodeURIComponent(limit)}&status=PUBLISHED`;

  try {
    const res = await fetch(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);
    const list = payload?.data;

    if (!res.ok || !Array.isArray(list)) {
      return NextResponse.json([]);
    }

    return NextResponse.json(list.map(toBlogItem));
  } catch (error) {
    return NextResponse.json([]);
  }
}
