/**
 * @file newsMapper.js
 * Hàm chuyển đổi dữ liệu news từ backend sang định dạng frontend (BlogItem).
 */

import { R2_PUBLIC_BASE_URL } from "@/config/env";

const FALLBACK_IMAGE = "/assets/images/property/11.jpg";

/**
 * Chuẩn hóa mảng tags từ nhiều định dạng khác nhau của backend.
 *
 * @param {any} raw
 * @returns {string[]}
 */
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
    arr = raw.split(/[;,]/g);
  } else if (Array.isArray(raw?.data)) {
    arr = raw.data;
  }

  return arr.map(toTagString).map((s) => s.trim()).filter(Boolean);
}

/**
 * Map một news item từ backend sang định dạng BlogItem frontend.
 *
 * @param {any} newsItem - News object từ backend
 * @returns {object}
 */
export function mapNewsToBlogItem(newsItem) {
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
  let tags = [];

  if (Array.isArray(rawTags) && rawTags.length > 0) {
    tags = rawTags.map((t, idx) => {
      if (typeof t === "string") return { id: idx + 1, name: t.trim(), type: "tag" };
      if (typeof t === "object" && t !== null) {
        return {
          id: t.id ?? idx + 1,
          name: t.name || t.label || t.title || t.value || "",
          type: "tag"
        };
      }
      return null;
    }).filter(t => t && t.name);

    const uniqueTags = [];
    const seen = new Set();
    for (const tag of tags) {
      if (!seen.has(tag.name)) {
        seen.add(tag.name);
        uniqueTags.push(tag);
      }
    }
    tags = uniqueTags;
  }

  if (tags.length === 0) {
    if (newsItem?.category) {
      tags = [{ id: newsItem.category, name: "Danh mục", type: "category" }];
    }
  }

  // Resolve image URL
  const rawImg = newsItem?.img;
  let finalImg = FALLBACK_IMAGE;
  if (rawImg) {
    finalImg = `${R2_PUBLIC_BASE_URL}/${rawImg}`;
  }
  return {
    id: String(newsItem?.id ?? ""),
    img: finalImg,
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
    tags,
    publishedAt: isValidDate ? createdAt.toISOString() : null,
    views: Number.isFinite(viewsNum) ? viewsNum : 0,
    author: authorFromUsers,
    slug: newsItem?.slug || "",
  };
}
