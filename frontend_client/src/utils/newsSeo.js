import { API_BASE_URL, SITE_URL } from "@/config/env";

const FALLBACK_IMAGE = "/assets/images/property/11.jpg";

function getBackendApiBaseUrl() {
  return API_BASE_URL;
}

function getSiteUrl() {
  return SITE_URL;
}

function toAbsoluteUrl(maybeUrl, siteUrl) {
  if (!maybeUrl) return undefined;
  if (typeof maybeUrl !== "string") return undefined;
  if (maybeUrl.startsWith("http://") || maybeUrl.startsWith("https://")) return maybeUrl;
  if (maybeUrl.startsWith("//")) return `https:${maybeUrl}`;
  // Relative path
  if (maybeUrl.startsWith("/")) return `${siteUrl}${maybeUrl}`;
  return `${siteUrl}/${maybeUrl}`;
}

function normalizeTags(raw) {
  if (!raw) return [];

  const toTagString = (t) => {
    if (typeof t === "string") return t;
    if (typeof t === "number") return String(t);
    if (t && typeof t === "object") return t?.name || t?.label || t?.title || t?.value || "";
    return "";
  };

  let arr = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === "string") {
    // Accept comma/semicolon separated strings from backend.
    arr = raw.split(/[;,]/g);
  } else if (Array.isArray(raw?.data)) {
    arr = raw.data;
  }

  return arr.map(toTagString).map((s) => s.trim()).filter(Boolean);
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

  const rawTags = newsItem?.tags ?? newsItem?.tag ?? newsItem?.keywords ?? newsItem?.keyword;
  const normalizedTags = normalizeTags(rawTags);
  const tags =
    normalizedTags.length > 0
      ? Array.from(new Set(normalizedTags))
      : newsItem?.category
        ? [String(newsItem.category)]
        : [];

  return {
    id: String(newsItem?.id ?? ""),
    img: newsItem?.featured_image || FALLBACK_IMAGE,
    date: isValidDate ? String(createdAt.getDate()).padStart(2, "0") : "",
    month: isValidDate ? createdAt.toLocaleString("en-US", { month: "short" }).toUpperCase() : "",
    year: isValidDate ? createdAt.getFullYear() : "",
    place: newsItem?.category || "News",
    title: newsItem?.title || "Untitled",
    detail: newsItem?.summary || "",
    summary: newsItem?.summary || "",
    content: newsItem?.content || "",
    tags,
    publishedAt: isValidDate ? createdAt.toISOString() : null,
    views: Number.isFinite(viewsNum) ? viewsNum : 0,
    author: authorFromUsers,
    slug: newsItem?.slug || "",
  };
}

export async function fetchNewsItemById(id) {
  const backendApiBaseUrl = getBackendApiBaseUrl();
  const safeId = typeof id === "string" ? id.trim() : "";
  if (!safeId) return null;

  try {
    const targetUrl = `${backendApiBaseUrl}/news/${encodeURIComponent(safeId)}`;
    const res = await fetch(targetUrl, { cache: "no-store" });
    const payload = await res.json().catch(() => null);

    if (!res.ok || !payload) return null;
    if (payload?.status && payload.status !== "PUBLISHED") return null;
    return toBlogItem(payload);
  } catch (e) {
    return null;
  }
}

export { getSiteUrl, toAbsoluteUrl };

