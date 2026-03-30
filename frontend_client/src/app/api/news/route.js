import { NextResponse } from "next/server";

const FALLBACK_BACKEND_API_URL = "http://localhost:3000/api";
const FALLBACK_IMAGE = "/assets/images/property/11.jpg";

function getBackendApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    process.env.BACKEND_API_URL ||
    FALLBACK_BACKEND_API_URL
  );
}

function parsePositiveInt(value, { defaultValue, min = 1, max = 50 } = {}) {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  if (!Number.isFinite(n)) return defaultValue;
  return Math.min(max, Math.max(min, n));
}

function toBlogItem(newsItem) {
  const createdAtSource = newsItem?.published_at || newsItem?.created_at || null;
  const createdAt = createdAtSource ? new Date(createdAtSource) : null;
  const isValidDate = createdAt ? !Number.isNaN(createdAt.getTime()) : false;

  const authorFromUsers = (() => {
    const users = newsItem?.users;
    const userObj = Array.isArray(users) ? users[0] : users;
    return userObj?.full_name || userObj?.username || "";
  })();

  const viewsNum =
    typeof newsItem?.views === "number"
      ? newsItem.views
      : newsItem?.views
        ? Number(newsItem.views)
        : 0;

  return {
    id: String(newsItem?.id ?? ""),
    img: newsItem?.featured_image || FALLBACK_IMAGE,
    date: isValidDate ? String(createdAt.getDate()).padStart(2, "0") : "",
    month: isValidDate
      ? createdAt.toLocaleString("en-US", { month: "short" }).toUpperCase()
      : "",
    year: isValidDate ? createdAt.getFullYear() : "",
    place: newsItem?.category || "News",
    title: newsItem?.title || "Untitled",
    detail: newsItem?.summary || "",
    summary: newsItem?.summary || "",
    content: newsItem?.content || "",
    views: Number.isFinite(viewsNum) ? viewsNum : 0,
    author: authorFromUsers,
    slug: newsItem?.slug || "",
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get("id");
  const id = typeof rawId === "string" ? rawId.trim() : "";

  // If `id` exists -> return a single news item.
  // This keeps the API surface as `/api/news` only (no dynamic segment route).
  if (id) {
    const backendApiBaseUrl = getBackendApiBaseUrl();

    try {
      const targetUrl = `${backendApiBaseUrl}/news/${encodeURIComponent(id)}`;
      const res = await fetch(targetUrl, { cache: "no-store" });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload) return NextResponse.json(null, { status: res.status || 500 });

      // Keep consistent with list endpoint (published only), if backend returns status.
      if (payload?.status && payload.status !== "PUBLISHED") {
        return NextResponse.json(null, { status: 404 });
      }

      return NextResponse.json(toBlogItem(payload));
    } catch (error) {
      return NextResponse.json(null, { status: 500 });
    }
  }

  const page = parsePositiveInt(searchParams.get("page"), {
    defaultValue: 1,
    min: 1,
    max: 9999,
  });
  const limit = parsePositiveInt(searchParams.get("limit"), {
    defaultValue: 6,
    min: 1,
    max: 30,
  });

  const targetUrl = (() => {
    const backendApiBaseUrl = getBackendApiBaseUrl();
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      status: "PUBLISHED",
    }).toString();
    return `${backendApiBaseUrl}/news?${query}`;
  })();

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
